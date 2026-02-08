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
        COALESCE(CAST(o.id AS CHAR), CONCAT('CD-', cdo.id)) as order_number,
        COALESCE(o.due_date, cdo.created_at) as due_date,
        COALESCE(o.status, cdo.status) as order_status,
        COALESCE(o.total_amount, cdo.estimated_price) as total_amount,
        COALESCE(o.created_at, cdo.created_at) as order_created_at,
        COALESCE(c.name, cdo.customer_name) as customer_name,
        CASE WHEN wo.custom_design_order_id IS NOT NULL THEN 1 ELSE 0 END as is_custom_design
      FROM work_orders wo
      LEFT JOIN users u ON wo.assigned_to = u.id
      LEFT JOIN orders o ON wo.order_id = o.id
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN custom_design_orders cdo ON wo.custom_design_order_id = cdo.id
    `;
    
    let whereClauses = [];
    let params = [];
    
    // If user is a technician, only show work orders assigned to them
    if (roleName === 'technician' || roleName === 'staff') {
      whereClauses.push('wo.assigned_to = ?');
      params.push(userId);
    }

    const { order_id } = req.query;
    if (order_id) {
      if (order_id.toString().startsWith('CD-')) {
        const cdoId = order_id.split('-')[1];
        whereClauses.push('wo.custom_design_order_id = ?');
        params.push(cdoId);
      } else {
        whereClauses.push('wo.order_id = ?');
        params.push(order_id);
      }
    }
    
    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(' AND ')}`;
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
    
    console.log('Fetching work order:', id, 'User:', userId);
    
    const [workOrder] = await pool.execute(`
      SELECT 
        wo.*,
        u.name as assigned_user_name,
        u.email as assigned_user_email,
        COALESCE(CAST(o.id AS CHAR), CONCAT('CD-', cdo.id)) as order_number,
        COALESCE(o.status, cdo.status) as order_status,
        o.quote_id,
        COALESCE(c.name, cdo.customer_name) as customer_name,
        COALESCE(c.email, cdo.customer_email) as customer_email,
        COALESCE(c.phone, cdo.customer_phone) as customer_phone,
        COALESCE(c.address, cdo.customer_location) as customer_address,
        cdo.product_type,
        cdo.design_description as requirements,
        cdo.width,
        cdo.height,
        cdo.bg_color,
        cdo.text_color,
        cdo.font_style,
        cdo.font_size,
        cdo.text_content,
        cdo.usage_description,
        1 as custom_quantity,
        NULL as paper_type,
        NULL as finish_type,
        CASE WHEN wo.custom_design_order_id IS NOT NULL THEN 1 ELSE 0 END as is_custom_design
      FROM work_orders wo
      LEFT JOIN users u ON wo.assigned_to = u.id
      LEFT JOIN orders o ON wo.order_id = o.id
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN custom_design_orders cdo ON wo.custom_design_order_id = cdo.id
      WHERE wo.id = ?
    `, [id]);
    
    console.log('Work order result:', workOrder.length, workOrder[0]);

    if (workOrder.length === 0) {
      console.log('Work order not found in DB');
      return res.status(404).json({ error: 'Work order not found' });
    }
    
    // If user is a technician or staff, verify they are assigned to this work order
    // "Technician" role in DB is usually 6. "Staff" in frontend code is mapped to role_id 3.
    // The roleName logic above might return 'accountant' if role_id is 3, because in SQL seeding:
    // (3, 'Accountant', ...)
    // But frontend maps 3 to 'Staff'.
    // To be safe, let's use a broader check: if not admin/owner/manager, ensure assignment.
    
    const isManagerial = [1, 2, 4, 5, 7].includes(req.user.role_id);
    // 1=Owner, 2=SysAdmin, 4=Controller, 5=Reception, 7=Prod Manager
    // If not managerial, strict assignment check:
    if (!isManagerial) {
        if (Number(workOrder[0].assigned_to) !== Number(userId)) {
             return res.status(403).json({ error: 'You do not have permission to view this work order' });
        }
    }

    // Fetch items from quote_items to provide description
    const [items] = await pool.execute('SELECT description, quantity FROM quote_items WHERE quote_id = ?', [workOrder[0].quote_id]);
    workOrder[0].items = items;
    
    res.json(workOrder[0]);
  } catch (error) {
    console.error('Get work order error:', error);
    res.status(500).json({ error: 'Failed to fetch work order' });
  }
};

export const updateWorkOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { started_at, ended_at, notes, assigned_to, stage } = req.body;

    // Dynamic update query
    const fields = [];
    const values = [];

    if (started_at !== undefined) { fields.push('started_at = ?'); values.push(started_at); }
    if (ended_at !== undefined) { fields.push('ended_at = ?'); values.push(ended_at); }
    if (notes !== undefined) { fields.push('notes = ?'); values.push(notes); }
    if (assigned_to !== undefined) { fields.push('assigned_to = ?'); values.push(assigned_to); }
    if (stage !== undefined) { fields.push('stage = ?'); values.push(stage); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    await pool.execute(
      `UPDATE work_orders SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    // Sync back to custom_design_orders if this is a custom design work order
    const [woData] = await pool.execute('SELECT custom_design_order_id FROM work_orders WHERE id = ?', [id]);
    if (woData.length > 0 && woData[0].custom_design_order_id) {
      const cdoId = woData[0].custom_design_order_id;
      const cdoUpdates = [];
      const cdoParams = [];

      if (stage) {
        cdoUpdates.push('production_stage = ?');
        cdoParams.push(stage);
      }
      if (assigned_to !== undefined) {
        cdoUpdates.push('assigned_to = ?');
        cdoParams.push(assigned_to);
      }

      if (cdoUpdates.length > 0) {
        cdoParams.push(cdoId);
        await pool.execute(
          `UPDATE custom_design_orders SET ${cdoUpdates.join(', ')} WHERE id = ?`,
          cdoParams
        );
      }
    }
    
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
    let { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role_id;

    // Security check: Only Admins (1, 2), Reception (5) or Assigned Staff (3) can update status
    // For Staff, we will verify assignment below
    if (![1, 2, 3, 5].includes(userRole)) {
       return res.status(403).json({ error: 'Permission denied' });
    }
    
    let isCustomDesign = false;
    let numericId = id;

    if (id.toString().startsWith('CD-')) {
      isCustomDesign = true;
      numericId = id.split('-')[1];
    }

    // Map production stages to main order statuses
    let mainOrderStatus = status;
    const productionStages = ['print', 'finish', 'design', 'prepress', 'qa', 'finishing'];
    
    if (productionStages.includes(status)) {
        if (status === 'design') mainOrderStatus = 'pending';
        else mainOrderStatus = 'processing';
    }

    if (isCustomDesign) {
      // Check if custom design order exists
      const [order] = await pool.execute('SELECT id, customer_email, customer_name FROM custom_design_orders WHERE id = ?', [numericId]);
      if (order.length === 0) {
        return res.status(404).json({ error: 'Custom design order not found' });
      }

      // Verify staff assignment (Role 3)
      if (userRole === 3) {
          // Check if user is assigned to any work order linked to this Custom Design Order
          console.log('=== ASSIGNMENT CHECK START ===');
          console.log('Custom Design Order ID:', numericId);
          console.log('User ID:', userId, 'Type:', typeof userId);
          console.log('User Role:', userRole);
          
          const [wo] = await pool.execute('SELECT id, assigned_to FROM work_orders WHERE custom_design_order_id = ?', [numericId]);
          console.log('Found work orders:', JSON.stringify(wo, null, 2));
          
          if (wo.length === 0) {
              console.log('ERROR: No work orders found for custom_design_order_id:', numericId);
              return res.status(403).json({ error: 'No work order found for this custom design order' });
          }
          
          console.log('Checking assignment...');
          wo.forEach((w, index) => {
              console.log(`Work Order ${index}:`, {
                  id: w.id,
                  assigned_to: w.assigned_to,
                  assigned_to_type: typeof w.assigned_to,
                  matches: Number(w.assigned_to) === Number(userId)
              });
          });
          
          const assignedWorkOrder = wo.find(w => Number(w.assigned_to) === Number(userId));
          console.log('Assigned Work Order Found:', assignedWorkOrder ? 'YES' : 'NO');
          
          if (!assignedWorkOrder) {
              console.log('ERROR: User not assigned to any work order');
              return res.status(403).json({ 
                  error: 'You are not assigned to this order',
                  debug: {
                      userId,
                      userIdType: typeof userId,
                      workOrders: wo.map(w => ({ id: w.id, assigned_to: w.assigned_to, type: typeof w.assigned_to }))
                  }
              });
          }
          console.log('=== ASSIGNMENT CHECK PASSED ===');
      }

      await pool.execute('UPDATE custom_design_orders SET status = ?, updated_at = NOW() WHERE id = ?', [mainOrderStatus, numericId]);
      
      // Update linked work order if exists
      await pool.execute('UPDATE work_orders SET stage = ? WHERE custom_design_order_id = ?', [status, numericId]);

      // Send status update email if ready
      if (['ready', 'completed'].includes(status) && order[0].customer_email) {
        try {
          await emailService.sendCustomDesignStatusUpdate(order[0].customer_email, {
            id: numericId,
            customer_name: order[0].customer_name,
            status: status
          });
        } catch (emailError) {
          console.error('Failed to send email:', emailError);
        }
      }
    } else {
      // Standard order logic
      const [order] = await pool.execute('SELECT id FROM orders WHERE id = ?', [id]);
      
      if (order.length === 0) {
        // Fallback: check if it's a numeric ID but actually a custom design
        const [cdo_order] = await pool.execute('SELECT id FROM custom_design_orders WHERE id = ?', [id]);
        if (cdo_order.length > 0) {
            // Check assignment if user is only staff
            if (userRole === 3) {
                // Check against work_orders for assignment
                const [wo] = await pool.execute('SELECT id, assigned_to FROM work_orders WHERE custom_design_order_id = ?', [id]);
                const assignedWo = wo.find(w => Number(w.assigned_to) === Number(userId));
                if (!assignedWo) {
                    return res.status(403).json({ error: 'You are not assigned to this order' });
                }
            }

           // Process as custom design
           isCustomDesign = true;
           numericId = id;
           await pool.execute('UPDATE custom_design_orders SET status = ?, updated_at = NOW() WHERE id = ?', [mainOrderStatus, numericId]);
           await pool.execute('UPDATE work_orders SET stage = ? WHERE custom_design_order_id = ?', [status, numericId]);
           return res.json({ message: 'Custom design order status updated' });
        }
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Verify staff assignment for standard order (Role 3)
      if (userRole === 3) {
          // Check if user is assigned to any work order linked to this order
          const [wo] = await pool.execute('SELECT id, assigned_to FROM work_orders WHERE order_id = ?', [id]);
          const assignedWo = wo.find(w => Number(w.assigned_to) === Number(userId));
          
          if (!assignedWo) {
              return res.status(403).json({ error: 'You are not assigned to this order' });
          }
      }

      await pool.execute('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

      // Also update the work_order stage to keep them in sync
      await pool.execute('UPDATE work_orders SET stage = ? WHERE order_id = ?', [status, id]);
      
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
          } catch (emailError) {
            console.error('Failed to send email:', emailError);
          }
        }
      }
    }
    
    res.json({ message: 'Order status updated successfully' });
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