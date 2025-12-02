import express from 'express';
import { 
  createInvoice, getInvoices, getInvoice, updateInvoice,
  recordPayment, getPayments, 
  processLanariPayment, checkPaymentStatus,
  createPOSSale, getPOSSales,
  createJournalEntry, getJournalEntries, postJournalEntry,
  getChartOfAccounts,
} from '../controllers/financeController.js';
import { authenticateToken } from '../middleware/auth.js';
import rbacMiddleware from '../../middleware/rbac.js';
import { auditLog } from '../middleware/audit.js';
import pool from '../config/database.js';

const router = express.Router();

// Apply RBAC middleware to all routes
router.use(authenticateToken, rbacMiddleware);

// Invoice CRUD
router.post('/invoices', auditLog('CREATE', 'invoices'), createInvoice);
router.get('/invoices', getInvoices);
router.get('/invoices/:id', getInvoice);
router.put('/invoices/:id', auditLog('UPDATE', 'invoices'), updateInvoice);

// Payment CRUD
router.post('/payments', auditLog('CREATE', 'payments'), recordPayment);
router.get('/payments', getPayments);
router.get('/payments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [payment] = await pool.execute(`
      SELECT p.*, i.id as invoice_number, u.name as recorded_by
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.id
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [id]);
    
    if (payment.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    res.json(payment[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

// Lanari Payment Gateway
router.post('/payments/lanari', auditLog('CREATE', 'payments'), processLanariPayment);

// Refund payment
router.put('/payments/:payment_id/refund', auditLog('UPDATE', 'payments'), async (req, res) => {
  try {
    const { payment_id } = req.params;
    const { reason } = req.body;
    
    // Get payment and customer details
    const [payment] = await pool.execute(`
      SELECT p.*, c.email, c.name as customer_name, i.id as invoice_id
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.id
      JOIN orders o ON i.order_id = o.id
      JOIN customers c ON o.customer_id = c.id
      WHERE p.id = ?
    `, [payment_id]);
    
    if (payment.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    // Update payment status to refunded
    await pool.execute(
      'UPDATE payments SET status = "refunded" WHERE id = ?',
      [payment_id]
    );
    
    // Send refund email to customer
    if (payment[0].email) {
      const { sendFreeEmail } = await import('../services/freeCommunicationService.js');
      await sendFreeEmail(
        payment[0].email,
        'Payment Refund Processed',
        `<h3>Hello ${payment[0].customer_name},</h3>
         <p>Your payment of ${payment[0].amount} has been refunded.</p>
         <p>Transaction ID: ${payment[0].gateway_transaction_id}</p>
         <p>Reason: ${reason || 'No reason provided'}</p>
         <p>The refund will appear in your account within 3-5 business days.</p>`
      );
    }
    
    res.json({ message: 'Payment refunded and customer notified' });
  } catch (error) {
    res.status(500).json({ error: 'Refund failed' });
  }
});

// POS Sales CRUD
router.post('/pos-sales', auditLog('CREATE', 'pos_sales'), createPOSSale);
router.get('/pos-sales', getPOSSales);

// Journal Entries CRUD
router.post('/journal-entries', auditLog('CREATE', 'journal_entries'), createJournalEntry);
router.get('/journal-entries', getJournalEntries);
router.get('/journal-entries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [entry] = await pool.execute('SELECT * FROM journal_entries WHERE id = ?', [id]);
    
    if (entry.length === 0) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }
    
    const [lines] = await pool.execute(`
      SELECT jl.*, coa.account_code, coa.name as account_name, coa.type as account_type
      FROM journal_lines jl
      JOIN chart_of_accounts coa ON jl.account_id = coa.id
      WHERE jl.journal_id = ?
    `, [id]);
    
    res.json({ ...entry[0], lines });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch journal entry' });
  }
});

// Post (finalize) a journal entry
router.put('/journal-entries/:id/post', auditLog('UPDATE', 'journal_entries'), postJournalEntry);

// Chart of Accounts
router.get('/chart-of-accounts', getChartOfAccounts);

export default router;