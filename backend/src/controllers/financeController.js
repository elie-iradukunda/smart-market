import pool from '../config/database.js';

export const createInvoice = async (req, res) => {
  try {
    const { order_id, amount } = req.body;
    
    // Check if order exists
    const [order] = await pool.execute('SELECT id FROM orders WHERE id = ?', [order_id]);
    if (order.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO invoices (order_id, amount) VALUES (?, ?)',
      [order_id, amount]
    );
    res.status(201).json({ id: result.insertId, message: 'Invoice created' });
  } catch (error) {
    res.status(500).json({ error: 'Invoice creation failed' });
  }
};

export const recordPayment = async (req, res) => {
  try {
    const { invoice_id, method, amount, reference } = req.body;
    
    // Check if invoice exists
    const [invoice] = await pool.execute('SELECT amount FROM invoices WHERE id = ?', [invoice_id]);
    if (invoice.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    await pool.execute(
      'INSERT INTO payments (invoice_id, method, amount, user_id, reference) VALUES (?, ?, ?, ?, ?)',
      [invoice_id, method, amount, req.user.id, reference]
    );

    const [payments] = await pool.execute(
      'SELECT SUM(amount) as total_paid FROM payments WHERE invoice_id = ?',
      [invoice_id]
    );

    const status = payments[0].total_paid >= invoice[0].amount ? 'paid' : 'partial';
    
    await pool.execute('UPDATE invoices SET status = ? WHERE id = ?', [status, invoice_id]);
    
    res.json({ message: 'Payment recorded' });
  } catch (error) {
    res.status(500).json({ error: 'Payment recording failed' });
  }
};

export const createPOSSale = async (req, res) => {
  try {
    const { customer_id, items, total } = req.body;
    
    // Check if customer exists (optional for POS)
    if (customer_id) {
      const [customer] = await pool.execute('SELECT id FROM customers WHERE id = ?', [customer_id]);
      if (customer.length === 0) {
        return res.status(404).json({ error: 'Customer not found' });
      }
    }
    
    const [result] = await pool.execute(
      'INSERT INTO pos_sales (customer_id, cashier_id, total) VALUES (?, ?, ?)',
      [customer_id, req.user.id, total]
    );

    const pos_id = result.insertId;
    
    for (const item of items) {
      await pool.execute(
        'INSERT INTO pos_items (pos_id, item_id, quantity, price) VALUES (?, ?, ?, ?)',
        [pos_id, item.item_id, item.quantity, item.price]
      );
    }

    res.status(201).json({ id: pos_id, message: 'POS sale recorded' });
  } catch (error) {
    res.status(500).json({ error: 'POS sale failed' });
  }
};

export const createJournalEntry = async (req, res) => {
  try {
    const { date, description, lines } = req.body;
    
    const [result] = await pool.execute(
      'INSERT INTO journal_entries (date, description) VALUES (?, ?)',
      [date, description]
    );

    const journal_id = result.insertId;
    
    for (const line of lines) {
      await pool.execute(
        'INSERT INTO journal_lines (journal_id, account_id, debit, credit) VALUES (?, ?, ?, ?)',
        [journal_id, line.account_id, line.debit || 0, line.credit || 0]
      );
    }

    res.status(201).json({ id: journal_id, message: 'Journal entry created' });
  } catch (error) {
    res.status(500).json({ error: 'Journal entry failed' });
  }
};

// GET operations
export const getInvoices = async (req, res) => {
  try {
    const [invoices] = await pool.execute(`
      SELECT i.*, o.id as order_number, c.name as customer_name
      FROM invoices i
      JOIN orders o ON i.order_id = o.id
      JOIN customers c ON o.customer_id = c.id
      ORDER BY i.created_at DESC
    `);
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

export const getInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const [invoice] = await pool.execute(`
      SELECT i.*, o.id as order_number, c.name as customer_name
      FROM invoices i
      JOIN orders o ON i.order_id = o.id
      JOIN customers c ON o.customer_id = c.id
      WHERE i.id = ?
    `, [id]);
    
    if (invoice.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    const [payments] = await pool.execute('SELECT * FROM payments WHERE invoice_id = ?', [id]);
    
    res.json({ ...invoice[0], payments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, status } = req.body;
    
    const [existing] = await pool.execute('SELECT id FROM invoices WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    await pool.execute(
      'UPDATE invoices SET amount = ?, status = ? WHERE id = ?',
      [amount, status, id]
    );
    
    res.json({ message: 'Invoice updated' });
  } catch (error) {
    res.status(500).json({ error: 'Invoice update failed' });
  }
};

export const getPayments = async (req, res) => {
  try {
    const [payments] = await pool.execute(`
      SELECT p.*, i.id as invoice_number, u.name as recorded_by
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.id
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

export const getPOSSales = async (req, res) => {
  try {
    const [sales] = await pool.execute(`
      SELECT ps.*, c.name as customer_name, u.name as cashier_name
      FROM pos_sales ps
      LEFT JOIN customers c ON ps.customer_id = c.id
      JOIN users u ON ps.cashier_id = u.id
      ORDER BY ps.created_at DESC
    `);
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch POS sales' });
  }
};

export const getJournalEntries = async (req, res) => {
  try {
    const [entries] = await pool.execute(`
      SELECT * FROM journal_entries ORDER BY date DESC
    `);
    res.json(entries);
  } catch (error) {
    console.error('Journal entries error:', error);
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
};

export const getChartOfAccounts = async (req, res) => {
  try {
    const [accounts] = await pool.execute(`
      SELECT id, account_code, name, type FROM chart_of_accounts ORDER BY account_code ASC
    `);
    res.json(accounts);
  } catch (error) {
    console.error('Chart of accounts error:', error);
    res.status(500).json({ error: 'Failed to fetch chart of accounts' });
  }
};