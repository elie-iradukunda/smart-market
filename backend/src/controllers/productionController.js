import pool from '../config/database.js';
import emailService from '../services/emailService.js';

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
    
    // Send work order assignment email to technician
    const [technicianData] = await pool.execute('SELECT email, name FROM users WHERE id = ?', [assigned_to]);
    const [orderData] = await pool.execute(`
      SELECT o.id, c.name as customer_name 
      FROM orders o 
      JOIN customers c ON o.customer_id = c.id 
      WHERE o.id = ?
    `, [order_id]);
    
    if (technicianData.length > 0 && technicianData[0].email) {
      try {
        await emailService.sendWorkOrderAssignment(technicianData[0].email, {
          work_order_id: result.insertId,
          order_id: order_id,
          stage: stage,
          technician_name: technicianData[0].name,
          customer_name: orderData[0]?.customer_name || 'Unknown'
        });
        console.log(`Work order assignment email sent to ${technicianData[0].email}`);
      } catch (emailError) {
        console.error('Failed to send work order assignment email:', emailError);
      }
    }
    
    res.status(201).json({ id: result.insertId, message: 'Work order created' });
  } catch (error) {
    console.error('Create work order error:', error);
    res.status(500).json({ error: 'Work order creation failed' });
  }
};

export const getWorkOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's role name to check if they're a technician
    const [userRoleData] = await pool.execute(
      'SELECT r.name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?',
      [userId]
    );
    
    const roleName = userRoleData[0]?.name?.toLowerCase() || '';
    
    let query = `
      SELECT 
        wo.*,
        u.name as assigned_user_name,
        o.id as order_number,
        o.due_date,
        o.created_at as order_created_at,
        c.name as customer_name
      FROM work_orders wo
      LEFT JOIN users u ON wo.assigned_to = u.id
      LEFT JOIN orders o ON wo.order_id = o.id
      LEFT JOIN customers c ON o.customer_id = c.id
    `;
    
    let params = [];
    
    // If user is a technician, only show work orders assigned to them
    if (roleName === 'technician') {
      alsoquery += ' WHERE wo.assigned_to = ?';
      params.push(userId);
    }
    
    query += ' ORDER BY wo.id DESC';
    
    const [workOrders] = await pool.execute(query, params);
    res.json(workOrders);
  } catch (error) {
    console.error('Get work orders error:', error);
    res.status(500).json({ error: 'Failed to fetch work orders' });
  }
};

export const getWorkOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Get user's role name
    const [userRoleData] = await pool.execute(
      'SELECT r.name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?',
      [userId]
    );
    
    const roleName = userRoleData[0]?.name?.toLowerCase() || '';
    
    const [workOrder] = await pool.execute(`
      SELECT 
        wo.*,
        u.name as assigned_user_name,
        u.email as assigned_user_email,
        o.id as order_number,
        o.status as order_status,
        o.quote_id,
        c.name as customer_name,
        c.email as customer_email
      FROM work_orders wo
      LEFT JOIN users u ON wo.assigned_to = u.id
      LEFT JOIN orders o ON wo.order_id = o.id
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE wo.id = ?
    `, [id]);
    
    if (workOrder.length === 0) {
      return res.status(404).json({ error: 'Work order not found' });
    }
    
    // If user is a technician, verify they are assigned to this work order
    if (roleName === 'technician' && workOrder[0].assigned_to !== userId) {
      return res.status(403).json({ error: 'You do not have permission to view this work order' });
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
    console.error('Update work order error:', error);
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
    console.error('Log work error:', error);
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
    
    // Send status update email to customer if order is ready or delivered
    if (['ready', 'delivered'].includes(status)) {
      const [customerData] = await pool.execute(`
        SELECT c.email, c.name 
        FROM customers c 
        JOIN orders o ON c.id = o.customer_id 
        WHERE o.id = ?
      `, [id]);
      
      if (customerData.length > 0 && customerData[0].email) {
        try {
          await emailService.sendOrderStatusUpdate(customerData[0].email, {
            order_id: id,
            customer_name: customerData[0].name,
            status: status
          });
          console.log(`Order status update email sent to ${customerData[0].email}`);
        } catch (emailError) {
          console.error('Failed to send order status update email:', emailError);
        }
      }
    }
    
    res.json({ message: 'Order status updated' });
  } catch (error) {
    console.error('Update order status error:', error);
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