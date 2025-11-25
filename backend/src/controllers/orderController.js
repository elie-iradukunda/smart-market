import pool from '../config/database.js';
import emailService from '../services/emailService.js';

export const createQuote = async (req, res) => {
  try {
    const { customer_id, items } = req.body;
    
    // Check if customer exists
    const [customer] = await pool.execute('SELECT id FROM customers WHERE id = ?', [customer_id]);
    if (customer.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    const total_amount = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

    const [result] = await pool.execute(
      'INSERT INTO quotes (customer_id, created_by, total_amount) VALUES (?, ?, ?)',
      [customer_id, req.user.id, total_amount]
    );

    const quote_id = result.insertId;

    for (const item of items) {
      await pool.execute(
        'INSERT INTO quote_items (quote_id, description, unit_price, quantity, total) VALUES (?, ?, ?, ?, ?)',
        [quote_id, item.description, item.unit_price, item.quantity, item.unit_price * item.quantity]
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
    
    await pool.execute(
      'INSERT INTO orders (quote_id, customer_id, status, balance) VALUES (?, ?, "design", ?)',
      [id, quote[0].customer_id, quote[0].total_amount]
    );

    // Send approval notification to customer
    const [customerData] = await pool.execute('SELECT email, name FROM customers WHERE id = ?', [quote[0].customer_id]);
    
    if (customerData.length > 0 && customerData[0].email) {
      try {
        await emailService.sendQuoteApproval(customerData[0].email, {
          quote_id: id,
          customer_name: customerData[0].name,
          total_amount: quote[0].total_amount
        });
        console.log(`Quote approval email sent to ${customerData[0].email}`);
      } catch (emailError) {
        console.error('Failed to send quote approval email:', emailError);
      }
    }
    
    // Notify Smart Market admin about new order
    try {
      await emailService.sendOrderNotification(process.env.ADMIN_EMAIL, {
        quote_id: id,
        customer_name: customerData[0]?.name || 'Unknown',
        total_amount: quote[0].total_amount
      });
      console.log('Order notification sent to admin');
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError);
    }
    
    res.json({ message: 'Quote approved and order created' });
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
      await pool.execute(
        'INSERT INTO quote_items (quote_id, description, unit_price, quantity, total) VALUES (?, ?, ?, ?, ?)',
        [id, item.description, item.unit_price, item.quantity, item.unit_price * item.quantity]
      );
    }
    
    res.json({ message: 'Quote updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Quote update failed' });
  }
};

export const getOrders = async (req, res) => {
  try {
    const [orders] = await pool.execute(`
      SELECT o.*, c.name as customer_name, q.total_amount 
      FROM orders o 
      JOIN customers c ON o.customer_id = c.id 
      LEFT JOIN quotes q ON o.quote_id = q.id
      ORDER BY o.created_at DESC
    `);

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(`
      SELECT o.*, c.name as customer_name, q.total_amount 
      FROM orders o 
      JOIN customers c ON o.customer_id = c.id 
      LEFT JOIN quotes q ON o.quote_id = q.id
      WHERE o.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};