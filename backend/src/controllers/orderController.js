import pool from '../config/database.js';
import emailService from '../services/emailService.js';
import { autoCreateInvoice } from './financeController.js';

export const createQuote = async (req, res) => {
  try {
    const { customer_id, items } = req.body;

    // Check if customer exists
    const [customer] = await pool.execute('SELECT id FROM customers WHERE id = ?', [customer_id]);
    if (customer.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    // Normalise/sanitise items to avoid NaN issues if frontend sends missing values
    const rawItems = Array.isArray(items) ? items : [];
    const normalisedItems = rawItems
      .map((item) => {
        const unit = Number(item.unit_price || 0);
        const qty = Number(item.quantity || 0);
        return {
          ...item,
          unit_price: Number.isFinite(unit) ? unit : 0,
          quantity: Number.isFinite(qty) ? qty : 0,
        };
      })
      .filter((item) => item.quantity > 0);

    if (normalisedItems.length === 0) {
      console.warn('createQuote: received no valid items, payload was:', items);
      return res.status(400).json({ error: 'Quote must contain at least one item with quantity > 0' });
    }

    const total_amount = normalisedItems.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    );

    const [result] = await pool.execute(
      'INSERT INTO quotes (customer_id, created_by, total_amount) VALUES (?, ?, ?)',
      [customer_id, req.user.id, total_amount]
    );

    const quote_id = result.insertId;

    for (const item of normalisedItems) {
      const materialId = item.material_id || item.materialId || null;
      await pool.execute(
        'INSERT INTO quote_items (quote_id, material_id, description, unit_price, quantity, total) VALUES (?, ?, ?, ?, ?, ?)',
        [quote_id, materialId, item.description, item.unit_price, item.quantity, item.unit_price * item.quantity]
      );
    }

    // Send quote to customer email
    const [customerData] = await pool.execute('SELECT email, name FROM customers WHERE id = ?', [customer_id]);

    if (customerData.length > 0 && customerData[0].email) {
      try {
        await emailService.sendQuote(customerData[0].email, {
          quote_id: quote_id,
          customer_name: customerData[0].name,
          total_amount: total_amount,
          items: items
        });
        console.log(`Quote email sent to ${customerData[0].email}`);
      } catch (emailError) {
        console.error('Failed to send quote email:', emailError);
      }
    }

    res.status(200).json({ quote_id, message: 'Quote created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Quote creation failed' });
  }
};

export const approveQuote = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if quote exists
    const [quote] = await pool.execute('SELECT * FROM quotes WHERE id = ?', [id]);
    if (quote.length === 0) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    // Check if quote is already approved
    if (quote[0].status === 'approved') {
      return res.status(400).json({ error: 'Quote is already approved' });
    }

    await pool.execute('UPDATE quotes SET status = "approved" WHERE id = ?', [id]);

    // Create order from this approved quote
    const [orderResult] = await pool.execute(
      'INSERT INTO orders (quote_id, customer_id, status, balance, total_amount) VALUES (?, ?, "design", ?, ?)',
      [id, quote[0].customer_id, quote[0].total_amount, quote[0].total_amount]
    );


    const orderId = orderResult.insertId;

    // AUTO-CREATE INVOICE
    try {
      await autoCreateInvoice(orderId, quote[0].total_amount);
      console.log(`Auto-invoice triggered for order ${orderId}`);
    } catch (invErr) {
      console.error('Failed to auto-create invoice:', invErr);
    }

    // Immediately reduce stock for each material on the quote.
    // If anything goes wrong here, we still want the quote and order
    // to remain approved/created, so we catch and log errors locally.
    try {
      const [items] = await pool.execute('SELECT id, material_id, quantity FROM quote_items WHERE quote_id = ?', [id]);

      console.log('approveQuote: loaded quote_items for quote', id, '→', items);

      for (const row of items) {
        if (!row) continue;
        const materialId = Number(row.material_id || row.materialId);
        const qty = Number(row.quantity || row.qty || 0);
        if (!materialId || !Number.isFinite(qty) || qty <= 0) {
          console.warn('approveQuote: skipping quote_item', row.id, 'materialId', materialId, 'qty', qty);
          continue;
        }

        // Decrement material stock
        await pool.execute(
          'UPDATE materials SET current_stock = current_stock - ? WHERE id = ?',
          [qty, materialId]
        );

        console.log('approveQuote: decremented material', materialId, 'by qty', qty, 'for order', orderId);

        // Log stock movement as an issue against this order
        await pool.execute(
          'INSERT INTO stock_movements (material_id, type, quantity, reference, user_id) VALUES (?, ?, ?, ?, ?)',
          [materialId, 'issue', qty, `ORDER-${orderId}`, req.user.id]
        );

        console.log('approveQuote: inserted stock_movement for material', materialId, 'qty', qty, 'order', orderId);
      }
    } catch (stockError) {
      console.error('Error reserving materials on quote approval:', stockError);
      // Do not rethrow; quote + order creation succeeded.
    }

    // Send approval notification to customer
    const [customerData] = await pool.execute('SELECT email, name FROM customers WHERE id = ?', [quote[0].customer_id]);
    let customerEmailSent = false;
    let adminEmailSent = false;

    if (customerData.length > 0 && customerData[0].email) {
      try {
        await emailService.sendQuoteApproval(customerData[0].email, {
          quote_id: id,
          customer_name: customerData[0].name,
          total_amount: quote[0].total_amount
        });
        console.log(`Quote approval email sent to ${customerData[0].email}`);
        customerEmailSent = true;
      } catch (emailError) {
        console.error('Failed to send quote approval email:', emailError);
      }
    }

    // Notify Top Design admin about new order
    try {
      await emailService.sendOrderNotification(process.env.ADMIN_EMAIL, {
        quote_id: id,
        customer_name: customerData[0]?.name || 'Unknown',
        total_amount: quote[0].total_amount
      });
      console.log('Order notification sent to admin');
      adminEmailSent = true;
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError);
    }

    // Send a single response after all operations are complete
    res.json({
      message: 'Quote approved, order created and materials reserved from stock',
      notifications: {
        customerEmail: customerEmailSent ? 'sent' : 'failed',
        adminEmail: adminEmailSent ? 'sent' : 'failed'
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Quote approval failed' });
  }
};

export const getQuotes = async (req, res) => {
  try {
    const [quotes] = await pool.execute(`
      SELECT q.*, c.name as customer_name 
      FROM quotes q 
      JOIN customers c ON q.customer_id = c.id 
      ORDER BY q.created_at DESC
    `);
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
};

export const getQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const [quote] = await pool.execute(`
      SELECT q.*, c.name as customer_name 
      FROM quotes q 
      JOIN customers c ON q.customer_id = c.id 
      WHERE q.id = ?
    `, [id]);

    if (quote.length === 0) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    const [items] = await pool.execute('SELECT * FROM quote_items WHERE quote_id = ?', [id]);

    res.json({ ...quote[0], items });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
};

export const updateQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_id, items } = req.body;

    // Check if quote exists
    const [existingQuote] = await pool.execute('SELECT id FROM quotes WHERE id = ?', [id]);
    if (existingQuote.length === 0) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    // Check if customer exists
    const [customer] = await pool.execute('SELECT id FROM customers WHERE id = ?', [customer_id]);
    if (customer.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const total_amount = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

    await pool.execute(
      'UPDATE quotes SET customer_id = ?, total_amount = ? WHERE id = ?',
      [customer_id, total_amount, id]
    );

    // Delete existing items and add new ones
    await pool.execute('DELETE FROM quote_items WHERE quote_id = ?', [id]);

    for (const item of items) {
      const materialId = item.material_id || item.materialId || null;
      await pool.execute(
        'INSERT INTO quote_items (quote_id, material_id, description, unit_price, quantity, total) VALUES (?, ?, ?, ?, ?, ?)',
        [id, materialId, item.description, item.unit_price, item.quantity, item.unit_price * item.quantity]
      );
    }

    res.json({ message: 'Quote updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Quote update failed' });
  }
};

export const getOrders = async (req, res) => {
  try {
    let whereClause = '';
    const params = [];

    // If user is a customer (Role 13) or Client (Role 4), filter by their email
    if (req.user && (req.user.role_id === 13 || req.user.role_id === 4)) {
      // Find customer IDs associated with this user's email
      const [customers] = await pool.execute('SELECT id FROM customers WHERE email = ?', [req.user.email]);
      
      if (customers.length === 0) {
        return res.json([]); // No customer record found for this user
      }

      const customerIds = customers.map(c => c.id).join(',');
      whereClause = `WHERE o.customer_id IN (${customerIds})`;
    }

    // Explicit customer_id filter (query param)
    const { customer_id } = req.query;
    if (customer_id) {
      whereClause = whereClause ? `${whereClause} AND o.customer_id = ?` : 'WHERE o.customer_id = ?';
      params.push(customer_id);
    }


    const [orders] = await pool.execute(`
      SELECT o.*, 
             c.name as customer_name, 
             i.id as invoice_id, 
             i.status as invoice_status,
             COALESCE(NULLIF(q.total_amount, 0), NULLIF(o.total_amount, 0), o.balance) as total_amount
      FROM orders o 
      JOIN customers c ON o.customer_id = c.id 
      LEFT JOIN quotes q ON o.quote_id = q.id
      LEFT JOIN invoices i ON i.order_id = o.id
      ${whereClause}
      ORDER BY o.created_at DESC
    `, params);

    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const getOrder = async (req, res) => {
  try {
    let { id } = req.params;
    let isCustomDesign = false;
    let numericId = id;

    if (id && id.toString().startsWith('CD-')) {
      isCustomDesign = true;
      numericId = id.split('-')[1];
    }

    if (isCustomDesign) {
      const [rows] = await pool.execute(`
        SELECT *, 
               customer_name, 
               customer_email, 
               customer_phone,
               estimated_price as total_amount,
               estimated_price as balance,
               'custom' as type
        FROM custom_design_orders 
        WHERE id = ?
      `, [numericId]);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Custom design order not found' });
      }

      // Add a compatible structure for OrderDetailPage
      const orderData = {
        ...rows[0],
        total_amount: rows[0].estimated_price,
        balance: rows[0].estimated_price,
        is_custom_design: true,
        customer_name: rows[0].customer_name,
        customer_email: rows[0].customer_email,
        customer_phone: rows[0].customer_phone
      };

      return res.json(orderData);
    }

    const [rows] = await pool.execute(`
      SELECT o.*, c.name as customer_name, q.total_amount 
      FROM orders o 
      JOIN customers c ON o.customer_id = c.id 
      LEFT JOIN quotes q ON o.quote_id = q.id
      WHERE o.id = ?
    `, [id]);

    if (rows.length === 0) {
      // Fallback: Check if it's a numeric ID but actually a custom design
      const [cdoRows] = await pool.execute('SELECT id FROM custom_design_orders WHERE id = ?', [id]);
      if (cdoRows.length > 0) {
         // Recursive call with prefix or just copy logic
         return getOrder({ ...req, params: { id: `CD-${id}` } }, res);
      }
      return res.status(404).json({ error: 'Order not found' });
    }

    // Security check: Ensure Customers (Role 13) and Clients (Role 4) only access their own orders
    if (req.user && (req.user.role_id === 13 || req.user.role_id === 4)) {
      const [userCustomers] = await pool.execute('SELECT id FROM customers WHERE email = ?', [req.user.email]);
      const allowedCustomerIds = userCustomers.map(c => c.id);
      
      if (!allowedCustomerIds.includes(rows[0].customer_id)) {
        return res.status(403).json({ error: 'Access denied to this order' });
      }
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

export const getOrdersReadyForCommunication = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT o.id as order_id, o.status, o.due_date, o.created_at,
              c.id as customer_id, c.name as customer_name, c.phone as customer_phone, c.email as customer_email
         FROM orders o
         JOIN customers c ON o.customer_id = c.id
        WHERE o.status = 'ready'
        ORDER BY o.due_date IS NULL, o.due_date ASC, o.created_at DESC`
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders for communication' });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Allowed fields to update
    const allowedFields = ['status', 'assigned_to', 'assigned_worker_id', 'due_date', 'notes', 'priority'];
    const fieldsToUpdate = [];
    const values = [];

    // Filter updates
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        fieldsToUpdate.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });

    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(id);

    const [result] = await pool.execute(
      `UPDATE orders SET ${fieldsToUpdate.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order updated successfully' });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM orders WHERE id = ?', [id]);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
};
