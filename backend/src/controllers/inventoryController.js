import pool from '../config/database.js';
import emailService from '../services/emailService.js';

// Utility function to handle database errors
const handleDatabaseError = (error, res) => {
  console.error('Database error:', error);
  return res.status(500).json({
    success: false,
    error: 'Database operation failed',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

// Material Controllers
export const createMaterial = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { name, unit, category, reorder_level } = req.body;

    if (!name || !unit) {
      return res.status(400).json({
        success: false,
        error: 'Name and unit are required'
      });
    }

    await connection.beginTransaction();

    try {
      // Check for duplicate material name (case-insensitive)
      const [existing] = await connection.execute(
        'SELECT id FROM materials WHERE LOWER(name) = LOWER(?)',
        [name.trim()]
      );

      if (existing.length > 0) {
        await connection.rollback();
        return res.status(409).json({
          success: false,
          error: 'A material with this name already exists'
        });
      }

      const [result] = await connection.execute(
        'INSERT INTO materials (name, unit, category, reorder_level) VALUES (?, ?, ?, ?)',
        [name.trim(), unit, category || null, reorder_level || 0]
      );

      await connection.commit();

      res.status(201).json({
        success: true,
        message: 'Material created successfully',
        data: { id: result.insertId }
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    return handleDatabaseError(error, res);
  } finally {
    connection.release();
  }
};

export const getMaterials = async (req, res) => {
  try {
    const [materials] = await pool.execute(`
      SELECT m.*, 
             COUNT(DISTINCT sm.id) as stock_movements_count
      FROM materials m
      LEFT JOIN stock_movements sm ON m.id = sm.material_id
      GROUP BY m.id
      ORDER BY m.name
    `);

    res.json({
      success: true,
      data: materials
    });
  } catch (error) {
    return handleDatabaseError(error, res);
  }
};

// Material Controllers
export const getMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const [material] = await pool.execute(
      'SELECT * FROM materials WHERE id = ?',
      [id]
    );

    if (material.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Material not found'
      });
    }

    res.json({
      success: true,
      data: material[0]
    });
  } catch (error) {
    console.error('Error fetching material:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch material',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updateMaterial = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { name, unit, category, reorder_level } = req.body;

    // Validate required fields
    if (!name || !unit) {
      return res.status(400).json({
        success: false,
        error: 'Name and unit are required'
      });
    }

    await connection.beginTransaction();

    try {
      // Check if material exists
      const [existing] = await connection.execute(
        'SELECT id FROM materials WHERE id = ? FOR UPDATE',
        [id]
      );

      if (existing.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          error: 'Material not found'
        });
      }

      // Check for duplicate name (case-insensitive, excluding current material)
      const [duplicate] = await connection.execute(
        'SELECT id FROM materials WHERE LOWER(name) = LOWER(?) AND id != ?',
        [name.trim(), id]
      );

      if (duplicate.length > 0) {
        await connection.rollback();
        return res.status(409).json({
          success: false,
          error: 'A material with this name already exists'
        });
      }

      // Update material
      await connection.execute(
        `UPDATE materials 
                 SET name = ?, unit = ?, category = ?, reorder_level = ?
                 WHERE id = ?`,
        [
          name.trim(),
          unit,
          category || null,
          reorder_level || 0,
          id
        ]
      );

      await connection.commit();

      // Get the updated material
      const [updatedMaterial] = await connection.execute(
        'SELECT * FROM materials WHERE id = ?',
        [id]
      );

      res.json({
        success: true,
        data: updatedMaterial[0]
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error updating material:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update material',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    connection.release();
  }
};

export const deleteMaterial = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;

    await connection.beginTransaction();

    try {
      // Check if material exists
      const [existing] = await connection.execute(
        'SELECT id FROM materials WHERE id = ? FOR UPDATE',
        [id]
      );

      if (existing.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          error: 'Material not found'
        });
      }

      // Check if material is used in stock movements
      const [stockMovements] = await connection.execute(
        'SELECT id FROM stock_movements WHERE material_id = ? LIMIT 1',
        [id]
      );

      if (stockMovements.length > 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          error: 'Cannot delete material with associated stock movements'
        });
      }



      // Delete material
      await connection.execute(
        'DELETE FROM materials WHERE id = ?',
        [id]
      );

      await connection.commit();

      res.json({
        success: true,
        message: 'Material deleted successfully'
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete material',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    connection.release();
  }
};

// ... [Previous code remains the same until the next change]

// Purchase Order Controllers
export const createPurchaseOrder = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const {
      supplier_id,
      reference_number,
      order_date,
      expected_delivery,
      delivery_address,
      payment_terms,
      notes,
      items,
      subtotal,
      tax,
      total,
      created_by,
      status = 'pending'
    } = req.body;

    // Validate required fields
    if (!supplier_id || !total) {
      return res.status(400).json({
        success: false,
        error: 'Supplier ID and total are required'
      });
    }

    // Check if supplier exists and get supplier details
    const [supplier] = await connection.execute(
      'SELECT id, name, email, contact, phone FROM suppliers WHERE id = ?',
      [supplier_id]
    );

    if (supplier.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Supplier not found'
      });
    }

    await connection.beginTransaction();

    try {
      // Create the purchase order with all fields
      const [result] = await connection.execute(
        `INSERT INTO purchase_orders (
          supplier_id, reference_number, order_date, expected_delivery, 
          delivery_address, payment_terms, notes, subtotal, tax, total, 
          created_by, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          supplier_id,
          reference_number || `PO-${Date.now().toString().slice(-6)}`,
          order_date || new Date(),
          expected_delivery,
          delivery_address,
          payment_terms || 'net_30',
          notes,
          subtotal || 0,
          tax || 0,
          total,
          created_by,
          status
        ]
      );

      const poId = result.insertId;

      // Insert purchase order items if provided
      if (items && Array.isArray(items) && items.length > 0) {
        for (const item of items) {
          await connection.execute(
            `INSERT INTO purchase_order_items (
              purchase_order_id, material_id, quantity, unit_price, total
            ) VALUES (?, ?, ?, ?, ?)`,
            [
              poId,
              item.material_id,
              item.quantity,
              item.unit_price,
              item.total || (item.quantity * item.unit_price)
            ]
          );
        }
      }

      await connection.commit();

      // Get the created PO with items for email
      const [createdPO] = await connection.execute(
        `SELECT po.*, s.name as supplier_name, s.email as supplier_email, 
                s.contact as supplier_contact, s.phone as supplier_phone
         FROM purchase_orders po
         LEFT JOIN suppliers s ON po.supplier_id = s.id
         WHERE po.id = ?`,
        [poId]
      );

      // Get PO items with material details
      const [poItems] = await connection.execute(
        `SELECT poi.*, m.name as material_name, m.unit as material_unit
         FROM purchase_order_items poi
         LEFT JOIN materials m ON poi.material_id = m.id
         WHERE poi.purchase_order_id = ?`,
        [poId]
      );

      // Send email to supplier if email exists
      if (supplier[0].email) {
        try {
          const emailService = (await import('../services/emailService.js')).default;

          const emailData = {
            ...createdPO[0],
            items: poItems,
            total_amount: total,
            tax_rate: 18
          };

          await emailService.sendPurchaseOrder(supplier[0].email, emailData);
          console.log(`Purchase order email sent to supplier: ${supplier[0].email}`);
        } catch (emailError) {
          console.error('Failed to send purchase order email:', emailError);
          // Don't fail the request if email fails
        }
      } else {
        console.warn(`Supplier ${supplier[0].name} has no email address. PO email not sent.`);
      }

      res.status(201).json({
        success: true,
        message: 'Purchase order created successfully',
        data: {
          ...createdPO[0],
          items: poItems
        }
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Error creating purchase order:', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });

    res.status(500).json({
      success: false,
      error: 'Failed to create purchase order',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });

  } finally {
    connection.release();
  }
};
// Purchase Order Controllers
export const getPurchaseOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, supplier_id } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    let whereClause = 'WHERE 1=1';

    if (status) {
      whereClause += ' AND po.status = ?';
      params.push(status);
    }

    if (supplier_id) {
      whereClause += ' AND po.supplier_id = ?';
      params.push(supplier_id);
    }

    // Get total count
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total 
             FROM purchase_orders po
             ${whereClause}`,
      params
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // Get paginated results with supplier details
    const [orders] = await pool.query(
      `SELECT 
                po.*, 
                s.name as supplier_name,
                s.contact as supplier_contact,
                s.rating as supplier_rating
             FROM purchase_orders po
             LEFT JOIN suppliers s ON po.supplier_id = s.id
             ${whereClause}
             ORDER BY po.created_at DESC, po.id DESC
             LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Return orders without items since we simplified the schema
    const ordersWithItems = orders;

    res.json({
      success: true,
      data: ordersWithItems,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch purchase orders',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getPurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Get purchase order with supplier details
    const [orders] = await pool.query(
      `SELECT 
                po.*, 
                s.name as supplier_name,
                s.contact as supplier_contact,
                s.rating as supplier_rating
             FROM purchase_orders po
             LEFT JOIN suppliers s ON po.supplier_id = s.id
             WHERE po.id = ?`,
      [id]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Purchase order not found'
      });
    }

    const order = orders[0];

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching purchase order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch purchase order',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updatePurchaseOrder = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const {
      supplier_id,
      status,
      expected_delivery_date,
      notes,
      items
    } = req.body;

    await connection.beginTransaction();

    try {
      // Check if purchase order exists
      const [existing] = await connection.execute(
        'SELECT * FROM purchase_orders WHERE id = ? FOR UPDATE',
        [id]
      );

      if (existing.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          error: 'Purchase order not found'
        });
      }

      // Update purchase order
      const updateFields = [];
      const updateValues = [];

      if (supplier_id !== undefined) {
        updateFields.push('supplier_id = ?');
        updateValues.push(supplier_id);
      }

      if (status) {
        updateFields.push('status = ?');
        updateValues.push(status);
      }

      if (expected_delivery_date) {
        updateFields.push('expected_delivery_date = ?');
        updateValues.push(expected_delivery_date);
      }

      if (notes !== undefined) {
        updateFields.push('notes = ?');
        updateValues.push(notes);
      }

      if (updateFields.length > 0) {
        updateValues.push(id);
        await connection.execute(
          `UPDATE purchase_orders 
                     SET ${updateFields.join(', ')}
                     WHERE id = ?`,
          updateValues
        );
      }



      await connection.commit();

      // Get the updated purchase order
      const [updatedOrder] = await connection.execute(
        'SELECT * FROM purchase_orders WHERE id = ?',
        [id]
      );

      res.json({
        success: true,
        data: updatedOrder[0]
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error updating purchase order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update purchase order',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    connection.release();
  }
};



// Stock Movement Controllers
export const createStockMovement = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const {
      material_id,
      type,
      movement_type,
      quantity,
      reference,
      reference_id,
      reference_type,
      notes
    } = req.body;

    // Use 'type' field (from schema) or fallback to 'movement_type'
    const movementType = type || movement_type;

    // Validate required fields
    if (!material_id || !movementType || !quantity) {
      return res.status(400).json({
        success: false,
        error: 'Material ID, movement type, and quantity are required'
      });
    }

    await connection.beginTransaction();

    try {
      // Check if material exists
      const [material] = await connection.execute(
        'SELECT id, name, current_stock FROM materials WHERE id = ? FOR UPDATE',
        [material_id]
      );

      if (material.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          error: 'Material not found'
        });
      }

      const currentStock = parseFloat(material[0].current_stock) || 0;
      const movementQty = parseFloat(quantity);
      let newStock = currentStock;

      // Handle different movement types
      switch (movementType) {
        case 'in':
        case 'grn':
        case 'return':
          newStock = currentStock + movementQty;
          break;
        case 'out':
        case 'issue':
        case 'damage':
          if (currentStock < movementQty) {
            await connection.rollback();
            return res.status(400).json({
              success: false,
              error: 'Insufficient stock'
            });
          }
          newStock = currentStock - movementQty;
          break;
        case 'adjustment':
          newStock = movementQty;
          break;
        default:
          await connection.rollback();
          return res.status(400).json({
            success: false,
            error: 'Invalid movement type. Must be "in", "out", "adjustment", "grn", "issue", "return", or "damage"'
          });
      }

      // Record the movement
      const [result] = await connection.execute(
        `INSERT INTO stock_movements 
         (material_id, type, quantity, reference, user_id)
         VALUES (?, ?, ?, ?, ?)`,
        [
          material_id,
          movementType,
          movementQty,
          reference || reference_id || null,
          req.user?.id || null
        ]
      );

      // Update material stock
      await connection.execute(
        'UPDATE materials SET current_stock = ? WHERE id = ?',
        [newStock, material_id]
      );

      await connection.commit();

      // Get the created movement with material details
      const [newMovement] = await connection.execute(`
        SELECT sm.*, m.name as material_name, m.unit as material_unit
        FROM stock_movements sm
        JOIN materials m ON sm.material_id = m.id
        WHERE sm.id = ?
      `, [result.insertId]);

      res.status(201).json({
        success: true,
        data: {
          ...newMovement[0],
          previous_stock: currentStock,
          new_stock: newStock
        }
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error creating stock movement:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create stock movement',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    connection.release();
  }
};

export const getStockMovements = async (req, res) => {
  try {
    const {
      material_id,
      movement_type,
      start_date,
      end_date,
      page = 1,
      limit = 20
    } = req.query;

    const offset = (page - 1) * limit;
    const params = [];
    let whereClause = 'WHERE 1=1';

    if (material_id) {
      whereClause += ' AND sm.material_id = ?';
      params.push(material_id);
    }

    if (movement_type) {
      whereClause += ' AND sm.movement_type = ?';
      params.push(movement_type);
    }

    if (start_date) {
      whereClause += ' AND DATE(sm.created_at) >= ?';
      params.push(start_date);
    }

    if (end_date) {
      whereClause += ' AND DATE(sm.created_at) <= ?';
      params.push(end_date);
    }

    // Get total count
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM stock_movements sm ${whereClause}`,
      params
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // Get paginated results
    const [movements] = await pool.query(
      `SELECT 
        sm.*, 
        m.name as material_name,
        m.unit as material_unit,
        u.name as user_name
       FROM stock_movements sm
       JOIN materials m ON sm.material_id = m.id
       LEFT JOIN users u ON sm.user_id = u.id
       ${whereClause}
       ORDER BY sm.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: movements,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching stock movements:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stock movements',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Make sure this is the last line in the file

// Supplier Controllers
export const createSupplier = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const {
      name,
      contact,
      email,
      phone,
      address,
      city,
      country,
      tax_id,
      payment_terms,
      bank_name,
      bank_account,
      notes,
      rating,
      is_active
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Supplier name is required'
      });
    }

    await connection.beginTransaction();

    try {
      // Check for duplicate supplier name
      const [existing] = await connection.execute(
        'SELECT id FROM suppliers WHERE LOWER(name) = LOWER(?)',
        [name.trim()]
      );

      if (existing.length > 0) {
        await connection.rollback();
        return res.status(409).json({
          success: false,
          error: 'A supplier with this name already exists'
        });
      }

      // Create supplier with all fields
      const [result] = await connection.execute(
        `INSERT INTO suppliers (
                    name, contact, email, phone, address, city, country,
                    tax_id, payment_terms, bank_name, bank_account, notes,
                    rating, is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name.trim(),
          contact || null,
          email || null,
          phone || null,
          address || null,
          city || null,
          country || 'Rwanda',
          tax_id || null,
          payment_terms || 'net_30',
          bank_name || null,
          bank_account || null,
          notes || null,
          rating || 0,
          is_active !== undefined ? is_active : true
        ]
      );

      await connection.commit();

      // Get the created supplier
      const [newSupplier] = await connection.execute(
        'SELECT * FROM suppliers WHERE id = ?',
        [result.insertId]
      );

      // Send welcome email
      if (email) {
        try {
          const emailService = (await import('../services/emailService.js')).default;
          await emailService.sendSupplierWelcome(email, {
            company_name: name,
            contact_name: contact,
            phone: phone,
            address: address,
            city: city,
            country: country,
            tax_id: tax_id,
            payment_terms: payment_terms,
            bank_name: bank_name,
            bank_account: bank_account
          });
          console.log(`Supplier welcome email sent to: ${email}`);
        } catch (emailError) {
          console.error('Failed to send supplier welcome email:', emailError);
        }
      }

      res.status(201).json({
        success: true,
        data: newSupplier[0]
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create supplier',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    connection.release();
  }
};

export const getSuppliers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    let whereClause = 'WHERE 1=1';

    if (search) {
      whereClause += ' AND (name LIKE ? OR contact LIKE ? OR email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Get total count
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM suppliers ${whereClause}`,
      params
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // Get paginated results
    const [suppliers] = await pool.query(
      `SELECT * FROM suppliers 
             ${whereClause}
             ORDER BY name
             LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: suppliers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch suppliers',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const [supplier] = await pool.execute(
      'SELECT * FROM suppliers WHERE id = ?',
      [id]
    );

    if (supplier.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Supplier not found'
      });
    }

    res.json({
      success: true,
      data: supplier[0]
    });
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch supplier',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updateSupplier = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const {
      name,
      contact,
      email,
      phone,
      address,
      city,
      country,
      tax_id,
      payment_terms,
      bank_name,
      bank_account,
      notes,
      rating,
      is_active
    } = req.body;

    await connection.beginTransaction();

    try {
      // Check if supplier exists
      const [existing] = await connection.execute(
        'SELECT id FROM suppliers WHERE id = ? FOR UPDATE',
        [id]
      );

      if (existing.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          error: 'Supplier not found'
        });
      }

      // Update supplier with all fields
      await connection.execute(
        `UPDATE suppliers SET 
                    name = ?, 
                    contact = ?, 
                    email = ?,
                    phone = ?,
                    address = ?,
                    city = ?,
                    country = ?,
                    tax_id = ?,
                    payment_terms = ?,
                    bank_name = ?,
                    bank_account = ?,
                    notes = ?,
                    rating = ?,
                    is_active = ?
                WHERE id = ?`,
        [
          name,
          contact || null,
          email || null,
          phone || null,
          address || null,
          city || null,
          country || 'Rwanda',
          tax_id || null,
          payment_terms || 'net_30',
          bank_name || null,
          bank_account || null,
          notes || null,
          rating || 0,
          is_active !== undefined ? is_active : true,
          id
        ]
      );

      await connection.commit();

      // Get the updated supplier
      const [updatedSupplier] = await connection.execute(
        'SELECT * FROM suppliers WHERE id = ?',
        [id]
      );

      res.json({
        success: true,
        data: updatedSupplier[0]
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update supplier',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    connection.release();
  }
};

export const deleteSupplier = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;

    await connection.beginTransaction();

    try {
      // Check if supplier exists
      const [existing] = await connection.execute(
        'SELECT id FROM suppliers WHERE id = ? FOR UPDATE',
        [id]
      );

      if (existing.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          error: 'Supplier not found'
        });
      }

      // Check if supplier has associated purchase orders
      const [purchaseOrders] = await connection.execute(
        'SELECT id FROM purchase_orders WHERE supplier_id = ? LIMIT 1',
        [id]
      );

      if (purchaseOrders.length > 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          error: 'Cannot delete supplier with associated purchase orders'
        });
      }

      // Delete supplier
      await connection.execute(
        'DELETE FROM suppliers WHERE id = ?',
        [id]
      );

      await connection.commit();

      res.json({
        success: true,
        message: 'Supplier deleted successfully'
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete supplier',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    connection.release();
  }
};

// ============================================================================
// Material Sales Controllers
// ============================================================================

// Set or update price per metre for a material (Admin only)
export const setMaterialPrice = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { price_per_metre, is_sellable } = req.body;

    if (price_per_metre === undefined || price_per_metre === null) {
      return res.status(400).json({
        success: false,
        error: 'price_per_metre is required'
      });
    }

    if (price_per_metre < 0) {
      return res.status(400).json({
        success: false,
        error: 'price_per_metre must be a positive number'
      });
    }

    await connection.beginTransaction();

    try {
      // Check if material exists
      const [material] = await connection.execute(
        'SELECT id, name FROM materials WHERE id = ? FOR UPDATE',
        [id]
      );

      if (material.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          error: 'Material not found'
        });
      }

      // Update material price
      // Convert boolean to 1/0 for MySQL compatibility
      const sellableValue = is_sellable !== undefined ? (is_sellable ? 1 : 0) : 1;

      await connection.execute(
        `UPDATE materials 
         SET price_per_metre = ?, is_sellable = ?
         WHERE id = ?`,
        [price_per_metre, sellableValue, id]
      );

      await connection.commit();

      // Get updated material
      const [updated] = await connection.execute(
        'SELECT * FROM materials WHERE id = ?',
        [id]
      );

      res.json({
        success: true,
        message: 'Material price updated successfully',
        data: updated[0]
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    return handleDatabaseError(error, res);
  } finally {
    connection.release();
  }
};

// Record a material sale
export const recordMaterialSale = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { material_id, customer_id, metres_sold, price_per_metre, notes } = req.body;
    const sold_by = req.user.id; // Get user from auth middleware

    // Validation
    if (!material_id || !metres_sold) {
      return res.status(400).json({
        success: false,
        error: 'material_id and metres_sold are required'
      });
    }

    if (metres_sold <= 0) {
      return res.status(400).json({
        success: false,
        error: 'metres_sold must be greater than 0'
      });
    }

    await connection.beginTransaction();

    try {
      // Check if material exists and is sellable
      const [material] = await connection.execute(
        'SELECT id, name, price_per_metre, is_sellable, current_stock FROM materials WHERE id = ? FOR UPDATE',
        [material_id]
      );

      if (material.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          error: 'Material not found'
        });
      }

      const materialData = material[0];

      if (!materialData.is_sellable) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          error: 'This material is not marked as sellable'
        });
      }

      // Use provided price or material's default price
      const salePrice = price_per_metre || materialData.price_per_metre;

      if (!salePrice || salePrice <= 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          error: 'Price per metre is not set for this material. Please set the price first.'
        });
      }

      // Check stock availability
      const availableStock = parseFloat(materialData.current_stock) || 0;
      const metresToSell = parseFloat(metres_sold);

      if (metresToSell > availableStock) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          error: `Insufficient stock. Available: ${availableStock.toFixed(2)} metres, Requested: ${metresToSell.toFixed(2)} metres`,
          available_stock: availableStock
        });
      }

      // Check if customer exists (if provided)
      if (customer_id) {
        const [customer] = await connection.execute(
          'SELECT id FROM customers WHERE id = ?',
          [customer_id]
        );
        if (customer.length === 0) {
          await connection.rollback();
          return res.status(404).json({
            success: false,
            error: 'Customer not found'
          });
        }
      }

      // Calculate total amount
      const total_amount = parseFloat(metres_sold) * parseFloat(salePrice);

      // Record the sale
      const [result] = await connection.execute(
        `INSERT INTO material_sales 
         (material_id, customer_id, sold_by, metres_sold, price_per_metre, total_amount, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          material_id,
          customer_id || null,
          sold_by,
          metres_sold,
          salePrice,
          total_amount,
          notes || null
        ]
      );

      // Update material stock (reduce stock by metres sold)
      // Double-check stock before updating to prevent negative values
      const [updatedStock] = await connection.execute(
        'UPDATE materials SET current_stock = current_stock - ? WHERE id = ? AND current_stock >= ?',
        [metres_sold, material_id, metres_sold]
      );

      if (updatedStock.affectedRows === 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          error: `Insufficient stock. Available: ${availableStock.toFixed(2)} metres, Requested: ${metresToSell.toFixed(2)} metres`,
          available_stock: availableStock
        });
      }

      // Record stock movement
      await connection.execute(
        `INSERT INTO stock_movements (material_id, type, quantity, reference, user_id)
         VALUES (?, 'issue', ?, ?, ?)`,
        [material_id, metres_sold, `SALE-${result.insertId}`, sold_by]
      );

      await connection.commit();

      // Get the created sale with details
      const [sale] = await connection.execute(
        `SELECT ms.*, 
                m.name as material_name, m.unit,
                c.name as customer_name,
                u.name as sold_by_name
         FROM material_sales ms
         JOIN materials m ON ms.material_id = m.id
         LEFT JOIN customers c ON ms.customer_id = c.id
         JOIN users u ON ms.sold_by = u.id
         WHERE ms.id = ?`,
        [result.insertId]
      );

      res.status(201).json({
        success: true,
        message: 'Material sale recorded successfully',
        data: sale[0]
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    return handleDatabaseError(error, res);
  } finally {
    connection.release();
  }
};

// Get all material sales with filters
export const getMaterialSales = async (req, res) => {
  try {
    const { material_id, customer_id, start_date, end_date, limit = 100, offset = 0 } = req.query;

    let query = `
      SELECT ms.*, 
             m.name as material_name, m.unit,
             c.name as customer_name, c.phone as customer_phone,
             u.name as sold_by_name
      FROM material_sales ms
      JOIN materials m ON ms.material_id = m.id
      LEFT JOIN customers c ON ms.customer_id = c.id
      JOIN users u ON ms.sold_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (material_id) {
      query += ' AND ms.material_id = ?';
      params.push(material_id);
    }

    if (customer_id) {
      query += ' AND ms.customer_id = ?';
      params.push(customer_id);
    }

    if (start_date) {
      query += ' AND DATE(ms.created_at) >= ?';
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND DATE(ms.created_at) <= ?';
      params.push(end_date);
    }

    query += ' ORDER BY ms.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [sales] = await pool.execute(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM material_sales ms
      WHERE 1=1
    `;
    const countParams = [];

    if (material_id) {
      countQuery += ' AND ms.material_id = ?';
      countParams.push(material_id);
    }

    if (customer_id) {
      countQuery += ' AND ms.customer_id = ?';
      countParams.push(customer_id);
    }

    if (start_date) {
      countQuery += ' AND DATE(ms.created_at) >= ?';
      countParams.push(start_date);
    }

    if (end_date) {
      countQuery += ' AND DATE(ms.created_at) <= ?';
      countParams.push(end_date);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: sales,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < total
      }
    });
  } catch (error) {
    return handleDatabaseError(error, res);
  }
};

// Get a single material sale by ID
export const getMaterialSale = async (req, res) => {
  try {
    const { id } = req.params;

    const [sales] = await pool.execute(
      `SELECT ms.*, 
              m.name as material_name, m.unit,
              c.name as customer_name, c.phone as customer_phone, c.email as customer_email,
              u.name as sold_by_name, u.email as sold_by_email
       FROM material_sales ms
       JOIN materials m ON ms.material_id = m.id
       LEFT JOIN customers c ON ms.customer_id = c.id
       JOIN users u ON ms.sold_by = u.id
       WHERE ms.id = ?`,
      [id]
    );

    if (sales.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Material sale not found'
      });
    }

    res.json({
      success: true,
      data: sales[0]
    });
  } catch (error) {
    return handleDatabaseError(error, res);
  }
};

// Get sellable materials (materials with price set)
export const getSellableMaterials = async (req, res) => {
  try {
    // Handle both boolean TRUE and integer 1 for is_sellable
    const [materials] = await pool.execute(
      `SELECT id, name, unit, category, price_per_metre, current_stock, is_sellable
       FROM materials
       WHERE (is_sellable = TRUE OR is_sellable = 1) 
         AND price_per_metre IS NOT NULL 
         AND price_per_metre > 0
       ORDER BY name`
    );

    res.json({
      success: true,
      data: materials
    });
  } catch (error) {
    // If columns don't exist, return empty array with helpful message
    if (error.message && error.message.includes('Unknown column')) {
      console.warn('Material sales columns not found. Please run migration 052_create_material_sales.sql');
      return res.json({
        success: true,
        data: [],
        message: 'Please run database migration to enable material sales feature'
      });
    }
    return handleDatabaseError(error, res);
  }
};

// Get sales statistics
export const getMaterialSalesStats = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let query = `
      SELECT 
        COUNT(*) as total_sales,
        SUM(metres_sold) as total_metres_sold,
        SUM(total_amount) as total_revenue,
        AVG(price_per_metre) as avg_price_per_metre
      FROM material_sales
      WHERE 1=1
    `;
    const params = [];

    if (start_date) {
      query += ' AND DATE(created_at) >= ?';
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND DATE(created_at) <= ?';
      params.push(end_date);
    }

    const [stats] = await pool.execute(query, params);

    // Get top selling materials
    let topMaterialsQuery = `
      SELECT 
        m.id,
        m.name,
        COUNT(ms.id) as sale_count,
        SUM(ms.metres_sold) as total_metres,
        SUM(ms.total_amount) as total_revenue
      FROM material_sales ms
      JOIN materials m ON ms.material_id = m.id
      WHERE 1=1
    `;
    const topParams = [];

    if (start_date) {
      topMaterialsQuery += ' AND DATE(ms.created_at) >= ?';
      topParams.push(start_date);
    }

    if (end_date) {
      topMaterialsQuery += ' AND DATE(ms.created_at) <= ?';
      topParams.push(end_date);
    }

    topMaterialsQuery += `
      GROUP BY m.id, m.name
      ORDER BY total_revenue DESC
      LIMIT 10
    `;

    const [topMaterials] = await pool.execute(topMaterialsQuery, topParams);

    res.json({
      success: true,
      data: {
        summary: stats[0],
        top_materials: topMaterials
      }
    });
  } catch (error) {
    return handleDatabaseError(error, res);
  }
};


// ... [Rest of the code remains the same]
