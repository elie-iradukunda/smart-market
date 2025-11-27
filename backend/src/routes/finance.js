import express from 'express';
import { 
  createInvoice, getInvoices, getInvoice, updateInvoice,
  recordPayment, getPayments, 
  processLanariPayment, checkPaymentStatus,
  createPOSSale, getPOSSales,
  createJournalEntry, getJournalEntries,
  getChartOfAccounts,
} from '../controllers/financeController.js';
import { authenticateToken, checkPermission } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';

const router = express.Router();

// Invoice CRUD
router.post('/invoices', authenticateToken, checkPermission('invoice.create'), auditLog('CREATE', 'invoices'), createInvoice);
router.get('/invoices', authenticateToken, checkPermission('invoice.create'), getInvoices);
router.get('/invoices/:id', authenticateToken, checkPermission('invoice.create'), getInvoice);
router.put('/invoices/:id', authenticateToken, checkPermission('invoice.create'), auditLog('UPDATE', 'invoices'), updateInvoice);

// Payment CRUD
router.post('/payments', authenticateToken, checkPermission('payment.create'), auditLog('CREATE', 'payments'), recordPayment);
router.get('/payments', authenticateToken, checkPermission('payment.create'), getPayments);

// Lanari Payment Gateway
router.post('/payments/lanari', authenticateToken, checkPermission('payment.create'), auditLog('CREATE', 'payments'), processLanariPayment);
router.get('/payments/:payment_id/status', authenticateToken, checkPermission('payment.create'), checkPaymentStatus);

// POS Sales CRUD
router.post('/pos-sales', authenticateToken, checkPermission('pos.create'), auditLog('CREATE', 'pos_sales'), createPOSSale);
router.get('/pos-sales', authenticateToken, checkPermission('pos.create'), getPOSSales);

// Journal Entries CRUD
router.post('/journal-entries', authenticateToken, checkPermission('journal.create'), auditLog('CREATE', 'journal_entries'), createJournalEntry);
router.get('/journal-entries', authenticateToken, checkPermission('journal.create'), getJournalEntries);

// Chart of accounts
router.get('/chart-of-accounts', authenticateToken, checkPermission('journal.create'), getChartOfAccounts);

export default router;