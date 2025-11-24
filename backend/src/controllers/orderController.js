import pool from '../config/database.js';

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
      'INSERT INTO orders (quote_id, customer_id, status, balance) VALUES (?, ?, "design", ?)',
      [id, quote[0].customer_id, quote[0].total_amount]
    );

    const orderId = orderResult.insertId;

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

    res.json({ message: 'Quote approved, order created and materials reserved from stock' });
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
    const [orders] = await pool.execute(`
      SELECT o.*, c.name as customer_name, q.total_amount,
             i.id as invoice_id, i.status as invoice_status
      FROM orders o 
      JOIN customers c ON o.customer_id = c.id 
      LEFT JOIN quotes q ON o.quote_id = q.id
      LEFT JOIN invoices i ON i.order_id = o.id
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