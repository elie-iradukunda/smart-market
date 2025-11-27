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
      total,
      status = 'pending'
    } = req.body;

    // Validate required fields
    if (!supplier_id || !total) {
      return res.status(400).json({ 
        success: false,
        error: 'Supplier ID and total are required' 
      });
    }

    // Check if supplier exists
    const [supplier] = await connection.execute(
      'SELECT id, name FROM suppliers WHERE id = ?', 
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
      // Create the purchase order
      const [result] = await connection.execute(
        `INSERT INTO purchase_orders (supplier_id, total, status) VALUES (?, ?, ?)`,
        [supplier_id, total, status]
      );

      const poId = result.insertId;

      await connection.commit();

      // Get the created PO
      const [createdPO] = await connection.execute(
        'SELECT * FROM purchase_orders WHERE id = ?',
        [poId]
      );

      res.status(201).json({
        success: true,
        message: 'Purchase order created successfully',
        data: createdPO[0]
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
          newStock = currentStock + movementQty;
          break;
        case 'out':
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
            error: 'Invalid movement type. Must be "in", "out", or "adjustment"' 
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
        const { name, contact, rating } = req.body;

        // Validate required fields
        if (!name || !contact) {
            return res.status(400).json({ 
                success: false,
                error: 'Name and contact information are required' 
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

            // Create supplier
            const [result] = await connection.execute(
                `INSERT INTO suppliers (name, contact, rating) VALUES (?, ?, ?)`,
                [name.trim(), contact, rating || 0]
            );

            await connection.commit();

            // Get the created supplier
            const [newSupplier] = await connection.execute(
                'SELECT * FROM suppliers WHERE id = ?',
                [result.insertId]
            );

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
        const { name, contact, rating } = req.body;

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

            // Update supplier
            await connection.execute(
                `UPDATE suppliers SET name = ?, contact = ?, rating = ? WHERE id = ?`,
                [name, contact, rating || 0, id]
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


// ... [Rest of the code remains the same]