import express from 'express';
import { 
  createInvoice, getInvoices, getInvoice, updateInvoice,
  recordPayment, getPayments, 
  processLanariPayment, checkPaymentStatus,
  createPOSSale, getPOSSales,
  createJournalEntry, getJournalEntries,
  getChartOfAccounts,
} from '../controllers/financeController.js';
import { authenticateToken } from '../middleware/auth.js';
import rbacMiddleware from '../../middleware/rbac.js';
import { auditLog } from '../middleware/audit.js';

const router = express.Router();

// Apply RBAC middleware to all routes
router.use(authenticateToken, rbacMiddleware);

// Invoice CRUD
router.post('/invoices', auditLog('CREATE', 'invoices'), createInvoice);
router.get('/invoices', getInvoices);
router.get('/invoices/:id', getInvoice);
router.put('/invoices/:id', auditLog('UPDATE', 'invoices'), updateInvoice);

// Payment CRUD
router.get('/payments', getPayments);

// Lanari Payment Gateway
router.post('/payments/lanari', auditLog('CREATE', 'payments'), processLanariPayment);
// router.put('/payments/:payment_id/refund', auditLog('UPDATE', 'payments'), processPaymentRefund); // TODO: Implement refund function
router.get('/payments/:payment_id/status', checkPaymentStatus);

// POS Sales CRUD
router.post('/pos-sales', auditLog('CREATE', 'pos_sales'), createPOSSale);
router.get('/pos-sales', getPOSSales);

// Journal Entries CRUD
router.post('/journal-entries', auditLog('CREATE', 'journal_entries'), createJournalEntry);
router.get('/journal-entries', getJournalEntries);

// Chart of accounts
router.get('/chart-of-accounts', getChartOfAccounts);

export default router;