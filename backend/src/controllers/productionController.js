import pool from '../config/database.js';

export const createWorkOrder = async (req, res) => {
  try {
    const { order_id, stage, assigned_to } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO work_orders (order_id, stage, assigned_to) VALUES (?, ?, ?)',
      [order_id, stage, assigned_to]
    );
    res.status(201).json({ id: result.insertId, message: 'Work order created' });
  } catch (error) {
    res.status(500).json({ error: 'Work order creation failed' });
  }
};

export const updateWorkOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { started_at, ended_at, notes } = req.body;
    
    await pool.execute(
      'UPDATE work_orders SET started_at = ?, ended_at = ?, notes = ? WHERE id = ?',
      [started_at, ended_at, notes, id]
    );
    
    res.json({ message: 'Work order updated' });
  } catch (error) {
    res.status(500).json({ error: 'Work order update failed' });
  }
};

export const logWork = async (req, res) => {
  try {
    const { work_order_id, time_spent_minutes, material_used } = req.body;
    
    await pool.execute(
      'INSERT INTO work_logs (work_order_id, technician_id, time_spent_minutes, material_used) VALUES (?, ?, ?, ?)',
      [work_order_id, req.user.id, time_spent_minutes, material_used]
    );
    
    res.json({ message: 'Work logged' });
  } catch (error) {
    res.status(500).json({ error: 'Work logging failed' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await pool.execute('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Order status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Status update failed' });
  }
};