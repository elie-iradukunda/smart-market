import pool from '../config/database.js';

export const createQuote = async (req, res) => {
  try {
    const { customer_id, items } = req.body;
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

    res.status(201).json({ quote_id, message: 'Quote created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Quote creation failed' });
  }
};

export const approveQuote = async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.execute('UPDATE quotes SET status = "approved" WHERE id = ?', [id]);
    
    const [quote] = await pool.execute('SELECT * FROM quotes WHERE id = ?', [id]);
    
    await pool.execute(
      'INSERT INTO orders (quote_id, customer_id, status, balance) VALUES (?, ?, "design", ?)',
      [id, quote[0].customer_id, quote[0].total_amount]
    );

    res.json({ message: 'Quote approved and order created' });
  } catch (error) {
    res.status(500).json({ error: 'Quote approval failed' });
  }
};

export const getOrders = async (req, res) => {
  try {
    const [orders] = await pool.execute(`
      SELECT o.*, c.name as customer_name, q.total_amount 
      FROM orders o 
      JOIN customers c ON o.customer_id = c.id 
      JOIN quotes q ON o.quote_id = q.id
      ORDER BY o.created_at DESC
    `);

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};