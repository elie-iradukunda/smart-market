import pool from '../config/database.js';

export const createWorkOrder = async (req, res) => {
  try {
    const { order_id, stage, assigned_to } = req.body;
    
    // Check if order exists
    const [order] = await pool.execute('SELECT id FROM orders WHERE id = ?', [order_id]);
    if (order.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check if user exists
    const [user] = await pool.execute('SELECT id FROM users WHERE id = ?', [assigned_to]);
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO work_orders (order_id, stage, assigned_to) VALUES (?, ?, ?)',
      [order_id, stage, assigned_to]
    );
    res.status(201).json({ id: result.insertId, message: 'Work order created' });
  } catch (error) {
    res.status(500).json({ error: 'Work order creation failed' });
  }
};

export const getWorkOrders = async (req, res) => {
  try {
    const [workOrders] = await pool.execute('SELECT * FROM work_orders ORDER BY id DESC');
    res.json(workOrders);
  } catch (error) {
    console.error('Get work orders error:', error);
    res.status(500).json({ error: 'Failed to fetch work orders' });
  }
};

export const getWorkOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const [workOrder] = await pool.execute('SELECT * FROM work_orders WHERE id = ?', [id]);
    
    if (workOrder.length === 0) {
      return res.status(404).json({ error: 'Work order not found' });
    }
    
    res.json(workOrder[0]);
  } catch (error) {
    console.error('Get work order error:', error);
    res.status(500).json({ error: 'Failed to fetch work order' });
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

export const getWorkLogs = async (req, res) => {
  try {
    const [workLogs] = await pool.execute('SELECT * FROM work_logs ORDER BY id DESC');
    res.json(workLogs);
  } catch (error) {
    console.error('Get work logs error:', error);
    res.status(500).json({ error: 'Failed to fetch work logs' });
  }
};

export const logWork = async (req, res) => {
  try {
    const { work_order_id, time_spent_minutes, material_used } = req.body;
    
    // Check if work order exists
    const [workOrder] = await pool.execute('SELECT id FROM work_orders WHERE id = ?', [work_order_id]);
    if (workOrder.length === 0) {
      return res.status(404).json({ error: 'Work order not found' });
    }
    
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
    
    // Check if order exists
    const [order] = await pool.execute('SELECT id FROM orders WHERE id = ?', [id]);
    if (order.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    await pool.execute('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Order status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Status update failed' });
  }
};

// Technicians: issue materials for an order and reduce inventory
export const issueOrderMaterials = async (req, res) => {
  try {
    const { id } = req.params;
    const { items } = req.body || {};

    // Basic validation
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No materials provided to issue' });
    }

    // Check order exists
    const [order] = await pool.execute('SELECT id FROM orders WHERE id = ?', [id]);
    if (order.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    for (const row of items) {
      if (!row) continue;
      const materialId = Number(row.material_id || row.materialId);
      const qty = Number(row.quantity || row.qty || 0);
      if (!materialId || !Number.isFinite(qty) || qty <= 0) continue;

      // Decrement material stock
      await pool.execute(
        'UPDATE materials SET current_stock = current_stock - ? WHERE id = ?',
        [qty, materialId]
      );

      // Log stock movement as an issue against this order
      await pool.execute(
        'INSERT INTO stock_movements (material_id, type, quantity, reference, user_id) VALUES (?, ?, ?, ?, ?)',
        [materialId, 'issue', qty, `ORDER-${id}`, req.user.id]
      );
    }

    res.json({ message: 'Materials issued for order' });
  } catch (error) {
    console.error('Issue materials error:', error);
    res.status(500).json({ error: 'Failed to issue materials for order' });
  }
};