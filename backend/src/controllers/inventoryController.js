import pool from '../config/database.js';

export const createMaterial = async (req, res) => {
  try {
    const { name, unit, category, reorder_level } = req.body;
    
    // Check for duplicate material name
    const [existing] = await pool.execute('SELECT id FROM materials WHERE name = ?', [name]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Material with this name already exists' });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO materials (name, unit, category, reorder_level) VALUES (?, ?, ?, ?)',
      [name, unit, category, reorder_level]
    );
    res.status(201).json({ id: result.insertId, message: 'Material created' });
  } catch (error) {
    res.status(500).json({ error: 'Material creation failed' });
  }
};

export const getMaterials = async (req, res) => {
  try {
    const [materials] = await pool.execute('SELECT * FROM materials ORDER BY name');
    res.json(materials);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
};

export const createStockMovement = async (req, res) => {
  try {
    const { material_id, type, quantity, reference } = req.body;
    
    await pool.execute(
      'INSERT INTO stock_movements (material_id, type, quantity, reference, user_id) VALUES (?, ?, ?, ?, ?)',
      [material_id, type, quantity, reference, req.user.id]
    );

    const multiplier = ['grn', 'return'].includes(type) ? 1 : -1;
    await pool.execute(
      'UPDATE materials SET current_stock = current_stock + ? WHERE id = ?',
      [quantity * multiplier, material_id]
    );

    res.json({ message: 'Stock movement recorded' });
  } catch (error) {
    res.status(500).json({ error: 'Stock movement failed' });
  }
};

export const createPurchaseOrder = async (req, res) => {
  try {
    const { supplier_id, total } = req.body;
    
    // Check if supplier exists
    const [supplier] = await pool.execute('SELECT id FROM suppliers WHERE id = ?', [supplier_id]);
    if (supplier.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO purchase_orders (supplier_id, total) VALUES (?, ?)',
      [supplier_id, total]
    );
    res.status(201).json({ id: result.insertId, message: 'Purchase order created' });
  } catch (error) {
    res.status(500).json({ error: 'Purchase order creation failed' });
  }
};

// Additional CRUD operations
export const getMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const [material] = await pool.execute('SELECT * FROM materials WHERE id = ?', [id]);
    if (material.length === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }
    res.json(material[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch material' });
  }
};

export const updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, unit, category, reorder_level } = req.body;
    
    const [existing] = await pool.execute('SELECT id FROM materials WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }
    
    // Check for duplicate name (excluding current material)
    const [duplicate] = await pool.execute('SELECT id FROM materials WHERE name = ? AND id != ?', [name, id]);
    if (duplicate.length > 0) {
      return res.status(409).json({ error: 'Material with this name already exists' });
    }
    
    await pool.execute(
      'UPDATE materials SET name = ?, unit = ?, category = ?, reorder_level = ? WHERE id = ?',
      [name, unit, category, reorder_level, id]
    );
    res.json({ message: 'Material updated' });
  } catch (error) {
    res.status(500).json({ error: 'Material update failed' });
  }
};

export const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute('DELETE FROM materials WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }
    res.json({ message: 'Material deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Material deletion failed' });
  }
};

export const getStockMovements = async (req, res) => {
  try {
    const [movements] = await pool.execute(`
      SELECT sm.*, m.name as material_name, u.name as user_name
      FROM stock_movements sm
      JOIN materials m ON sm.material_id = m.id
      JOIN users u ON sm.user_id = u.id
      ORDER BY sm.created_at DESC
    `);
    res.json(movements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stock movements' });
  }
};

export const getPurchaseOrders = async (req, res) => {
  try {
    const [orders] = await pool.execute(`
      SELECT po.*, s.name as supplier_name
      FROM purchase_orders po
      JOIN suppliers s ON po.supplier_id = s.id
      ORDER BY po.created_at DESC
    `);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch purchase orders' });
  }
};

export const getPurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const [order] = await pool.execute(`
      SELECT po.*, s.name as supplier_name
      FROM purchase_orders po
      JOIN suppliers s ON po.supplier_id = s.id
      WHERE po.id = ?
    `, [id]);
    
    if (order.length === 0) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }
    res.json(order[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch purchase order' });
  }
};

export const updatePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { supplier_id, total, status } = req.body;
    
    const [existing] = await pool.execute('SELECT id FROM purchase_orders WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }
    
    if (supplier_id) {
      const [supplier] = await pool.execute('SELECT id FROM suppliers WHERE id = ?', [supplier_id]);
      if (supplier.length === 0) {
        return res.status(404).json({ error: 'Supplier not found' });
      }
    }
    
    await pool.execute(
      'UPDATE purchase_orders SET supplier_id = ?, total = ?, status = ? WHERE id = ?',
      [supplier_id, total, status, id]
    );
    res.json({ message: 'Purchase order updated' });
  } catch (error) {
    res.status(500).json({ error: 'Purchase order update failed' });
  }
};

// Supplier CRUD
export const createSupplier = async (req, res) => {
  try {
    const { name, contact, rating } = req.body;
    
    // Check for duplicate supplier name
    const [existing] = await pool.execute('SELECT id FROM suppliers WHERE name = ?', [name]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Supplier with this name already exists' });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO suppliers (name, contact, rating) VALUES (?, ?, ?)',
      [name, contact, rating || 0]
    );
    res.status(201).json({ id: result.insertId, message: 'Supplier created' });
  } catch (error) {
    res.status(500).json({ error: 'Supplier creation failed' });
  }
};

export const getSuppliers = async (req, res) => {
  try {
    const [suppliers] = await pool.execute('SELECT * FROM suppliers ORDER BY name');
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
};

export const getSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const [supplier] = await pool.execute('SELECT * FROM suppliers WHERE id = ?', [id]);
    if (supplier.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json(supplier[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch supplier' });
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact, rating } = req.body;
    
    const [existing] = await pool.execute('SELECT id FROM suppliers WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    
    // Check for duplicate name (excluding current supplier)
    const [duplicate] = await pool.execute('SELECT id FROM suppliers WHERE name = ? AND id != ?', [name, id]);
    if (duplicate.length > 0) {
      return res.status(409).json({ error: 'Supplier with this name already exists' });
    }
    
    await pool.execute(
      'UPDATE suppliers SET name = ?, contact = ?, rating = ? WHERE id = ?',
      [name, contact, rating, id]
    );
    res.json({ message: 'Supplier updated' });
  } catch (error) {
    res.status(500).json({ error: 'Supplier update failed' });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute('DELETE FROM suppliers WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json({ message: 'Supplier deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Supplier deletion failed' });
  }
};