import pool from '../config/database.js';
import emailService from '../services/emailService.js';
import lanariPaymentService from '../services/lanariPaymentService.js';
import socketService from '../services/socketService.js';

export const createInvoice = async (req, res) => {
  try {
    const { order_id, amount } = req.body;
    
    // Check if order exists
    const [order] = await pool.execute('SELECT id FROM orders WHERE id = ?', [order_id]);
    if (order.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Prevent duplicate invoices for the same order
    const [existing] = await pool.execute('SELECT id FROM invoices WHERE order_id = ? LIMIT 1', [order_id]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'An invoice already exists for this order' });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO invoices (order_id, amount) VALUES (?, ?)',
      [order_id, amount]
    );
    
    // Get customer email to send invoice
    const [customer] = await pool.execute(`
      SELECT c.email, c.name 
      FROM customers c 
      JOIN orders o ON c.id = o.customer_id 
      WHERE o.id = ?
    `, [order_id]);
    
    if (customer.length > 0 && customer[0].email) {
      try {
        await emailService.sendInvoice(customer[0].email, {
          id: result.insertId,
          amount: amount,
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toDateString()
        });
        console.log(`Invoice email sent to ${customer[0].email}`);
      } catch (emailError) {
        console.error('Failed to send invoice email:', emailError);
      }
    }
    
    res.status(201).json({ id: result.insertId, message: 'Invoice created' });
  } catch (error) {
    res.status(500).json({ error: 'Invoice creation failed' });
  }
};

export const processLanariPayment = async (req, res) => {
  try {
    const { invoice_id, customer_phone, amount } = req.body;
    
    
    // Get invoice and customer details
    const [invoice] = await pool.execute(`
      SELECT i.*, c.name as customer_name, o.id as order_id
      FROM invoices i
      JOIN orders o ON i.order_id = o.id
      JOIN customers c ON o.customer_id = c.id
      WHERE i.id = ?
    `, [invoice_id]);
    
    if (invoice.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    // Create payment record first
    const [result] = await pool.execute(
      'INSERT INTO payments (invoice_id, method, amount, user_id, reference, status, gateway, gateway_transaction_id, gateway_response, customer_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [invoice_id, 'lanari', amount, req.user.id, 'pending', 'pending', 'lanari', 'pending', '{}', customer_phone]
    );
    
    const paymentId = result.insertId;
    
    // Emit payment created event
    socketService.emitPaymentCreated({
      payment_id: paymentId,
      invoice_id: invoice_id,
      amount: amount,
      status: 'pending',
      customer_phone: customer_phone
    });
    
    // Process payment through Lanari
    const paymentResult = await lanariPaymentService.processPayment({
      amount: Math.round(amount),
      customer_phone: customer_phone,
      currency: 'RWF',
      description: `Smart Market Invoice #${invoice_id} - ${invoice[0].customer_name}`
    });
    
    // Update payment record with API response
    const paymentStatus = paymentResult.success ? (paymentResult.transaction_id && paymentResult.transaction_id !== 'pending' ? 'completed' : 'pending') : 'failed';
    const transactionId = paymentResult.transaction_id || 'failed';
    
    await pool.execute(
      'UPDATE payments SET reference = ?, status = ?, gateway_transaction_id = ?, gateway_response = ? WHERE id = ?',
      [transactionId, paymentStatus, transactionId, JSON.stringify(paymentResult.raw_response || {}), paymentId]
    );
    
    // Emit payment status update
    if (paymentStatus === 'completed') {
      socketService.emitPaymentCompleted({
        payment_id: paymentId,
        invoice_id: invoice_id,
        amount: amount,
        status: 'completed',
        transaction_id: transactionId
      });
    } else if (paymentStatus === 'failed') {
      socketService.emitPaymentFailed({
        payment_id: paymentId,
        invoice_id: invoice_id,
        amount: amount,
        status: 'failed',
        error: paymentResult.error
      });
    } else {
      socketService.emitPaymentUpdated({
        payment_id: paymentId,
        invoice_id: invoice_id,
        amount: amount,
        status: paymentStatus,
        transaction_id: transactionId
      });
    }
    
    if (!paymentResult.success) {
      return res.status(400).json({ 
        error: 'Payment processing failed', 
        details: paymentResult.error,
        payment_id: paymentId,
        transaction_ref: transactionId,
        api_response: paymentResult.raw_response
      });
    }
    
    res.json({ 
      success: true,
      payment_id: paymentId,
      transaction_id: paymentResult.transaction_id,
      reference_id: paymentResult.reference_id,
      status: paymentStatus,
      message: paymentStatus === 'completed' ? 'Payment completed successfully' : 'Payment initiated successfully',
      lanari_response: paymentResult.raw_response
    });
  } catch (error) {
    console.error('Lanari payment error:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
};

export const checkPaymentStatus = async (req, res) => {
  try {
    const { payment_id } = req.params;
    
    // Get payment record
    const [payment] = await pool.execute(
      'SELECT * FROM payments WHERE id = ? AND gateway = "lanari"',
      [payment_id]
    );
    
    if (payment.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    // Check status with Lanari
    const statusResult = await lanariPaymentService.checkPaymentStatus(payment[0].gateway_transaction_id);
    
    if (statusResult.success && statusResult.data.status === 'completed') {
      // Update payment status
      await pool.execute(
        'UPDATE payments SET status = "completed", gateway_response = ? WHERE id = ?',
        [JSON.stringify(statusResult.data), payment_id]
      );
      
      // Update invoice status
      const [payments] = await pool.execute(
        'SELECT SUM(amount) as total_paid FROM payments WHERE invoice_id = ? AND status = "completed"',
        [payment[0].invoice_id]
      );
      
      const [invoice] = await pool.execute('SELECT amount FROM invoices WHERE id = ?', [payment[0].invoice_id]);
      const status = payments[0].total_paid >= invoice[0].amount ? 'paid' : 'partial';
      
      await pool.execute('UPDATE invoices SET status = ? WHERE id = ?', [status, payment[0].invoice_id]);
      
      // Emit payment completed event
      socketService.emitPaymentCompleted({
        payment_id: payment_id,
        invoice_id: payment[0].invoice_id,
        amount: payment[0].amount,
        status: 'completed',
        transaction_id: payment[0].gateway_transaction_id
      });

      // Send payment confirmation email for completed Lanari payment
      try {
        const [customer] = await pool.execute(`
          SELECT c.email, c.name, i.id as invoice_id
          FROM customers c 
          JOIN orders o ON c.id = o.customer_id 
          JOIN invoices i ON o.id = i.order_id
          WHERE i.id = ?
        `, [payment[0].invoice_id]);

        if (customer.length > 0 && customer[0].email) {
          await emailService.sendPaymentConfirmation(customer[0].email, {
            payment_id: payment[0].id,
            invoice_id: payment[0].invoice_id,
            amount: payment[0].amount,
            method: payment[0].method || 'lanari',
            status: status
          });
          console.log(`Lanari payment confirmation email sent to ${customer[0].email}`);
        }
      } catch (emailError) {
        console.error('Failed to send Lanari payment confirmation email:', emailError);
      }
    }
    
    res.json({
      payment_status: payment[0].status,
      gateway_status: statusResult.data?.status || 'unknown',
      transaction_id: payment[0].gateway_transaction_id
    });
  } catch (error) {
    console.error('Payment status check error:', error);
    res.status(500).json({ error: 'Status check failed' });
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
    
    const [result] = await pool.execute(
      'INSERT INTO payments (invoice_id, method, amount, user_id, reference, status) VALUES (?, ?, ?, ?, ?, ?)',
      [invoice_id, method || 'cash', amount, req.user.id, reference || null, 'completed']
    );

    const [payments] = await pool.execute(
      'SELECT SUM(amount) as total_paid FROM payments WHERE invoice_id = ?',
      [invoice_id]
    );

    const status = payments[0].total_paid >= invoice[0].amount ? 'paid' : 'partial';
    
    await pool.execute('UPDATE invoices SET status = ? WHERE id = ?', [status, invoice_id]);
    
    // Get customer email to send payment confirmation
    const [customer] = await pool.execute(`
      SELECT c.email, c.name, i.id as invoice_id
      FROM customers c 
      JOIN orders o ON c.id = o.customer_id 
      JOIN invoices i ON o.id = i.order_id
      WHERE i.id = ?
    `, [invoice_id]);
    
    if (customer.length > 0 && customer[0].email) {
      try {
        await emailService.sendPaymentConfirmation(customer[0].email, {
          payment_id: result.insertId,
          invoice_id: invoice_id,
          amount: amount,
          method: method || 'cash',
          status: status
        });
        console.log(`Payment confirmation email sent to ${customer[0].email}`);
      } catch (emailError) {
        console.error('Failed to send payment confirmation email:', emailError);
      }
    }
    
    res.json({ message: 'Payment recorded' });
  } catch (error) {
    console.error('Payment recording error:', error);
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
      [customer_id || null, req.user.id, total]
    );

    const pos_id = result.insertId;

    // Record POS line items and update inventory/stock movements for each material sold
    for (const item of items) {
      // Save the POS item row
      await pool.execute(
        'INSERT INTO pos_items (pos_id, item_id, quantity, price) VALUES (?, ?, ?, ?)',
        [pos_id, item.item_id, item.quantity, item.price]
      );

      // Decrement material stock based on quantity sold
      await pool.execute(
        'UPDATE materials SET current_stock = current_stock - ? WHERE id = ?',
        [item.quantity, item.item_id]
      );

      // Log a stock movement of type "issue" so inventory history stays consistent
      await pool.execute(
        'INSERT INTO stock_movements (material_id, type, quantity, reference, user_id) VALUES (?, ?, ?, ?, ?)',
        [item.item_id, 'issue', item.quantity, `POS-${pos_id}`, req.user.id]
      );
    }

    // Also create an order so the sale appears in production/finance flows
    let order_id = null;
    if (customer_id) {
      const [orderResult] = await pool.execute(
        'INSERT INTO orders (quote_id, customer_id, status, due_date, deposit_paid, balance) VALUES (NULL, ?, ?, NULL, 0, ?)',
        [customer_id, 'ready', total]
      );
      order_id = orderResult.insertId;
    }

    res.status(201).json({ id: pos_id, order_id, message: 'POS sale recorded' });
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

// Auto-create invoice when order is completed
export const autoCreateInvoice = async (order_id, amount) => {
  try {
    // Check if invoice already exists
    const [existing] = await pool.execute('SELECT id FROM invoices WHERE order_id = ?', [order_id]);
    if (existing.length > 0) {
      return { success: false, message: 'Invoice already exists' };
    }
    
    const [result] = await pool.execute(
      'INSERT INTO invoices (order_id, amount, status) VALUES (?, ?, ?)',
      [order_id, amount, 'pending']
    );
    
    // Get customer email for notification
    const [customer] = await pool.execute(`
      SELECT c.email, c.name 
      FROM customers c 
      JOIN orders o ON c.id = o.customer_id 
      WHERE o.id = ?
    `, [order_id]);
    
    if (customer.length > 0 && customer[0].email) {
      try {
        await emailService.sendInvoice(customer[0].email, {
          id: result.insertId,
          amount: amount,
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toDateString()
        });
      } catch (emailError) {
        console.error('Auto-invoice email failed:', emailError);
      }
    }
    
    return { success: true, invoice_id: result.insertId };
  } catch (error) {
    console.error('Auto-invoice creation failed:', error);
    return { success: false, error: error.message };
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