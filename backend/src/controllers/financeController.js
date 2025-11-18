import pool from '../config/database.js';

export const createInvoice = async (req, res) => {
  try {
    const { order_id, amount } = req.body;
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
    
    await pool.execute(
      'INSERT INTO payments (invoice_id, method, amount, user_id, reference) VALUES (?, ?, ?, ?, ?)',
      [invoice_id, method, amount, req.user.id, reference]
    );

    const [payments] = await pool.execute(
      'SELECT SUM(amount) as total_paid FROM payments WHERE invoice_id = ?',
      [invoice_id]
    );

    const [invoice] = await pool.execute('SELECT amount FROM invoices WHERE id = ?', [invoice_id]);
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