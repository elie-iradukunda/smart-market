import pool from '../config/database.js';

export const createMaterial = async (req, res) => {
  try {
    const { name, unit, category, reorder_level } = req.body;
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
    const [result] = await pool.execute(
      'INSERT INTO purchase_orders (supplier_id, total) VALUES (?, ?)',
      [supplier_id, total]
    );
    res.status(201).json({ id: result.insertId, message: 'Purchase order created' });
  } catch (error) {
    res.status(500).json({ error: 'Purchase order creation failed' });
  }
};