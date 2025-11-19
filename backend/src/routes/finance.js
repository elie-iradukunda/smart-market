import express from 'express';
import { 
  createInvoice, getInvoices, getInvoice, updateInvoice,
  recordPayment, getPayments, 
  createPOSSale, getPOSSales,
  createJournalEntry, getJournalEntries 
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

// POS Sales CRUD
router.post('/pos-sales', authenticateToken, checkPermission('pos.create'), auditLog('CREATE', 'pos_sales'), createPOSSale);
router.get('/pos-sales', authenticateToken, checkPermission('pos.create'), getPOSSales);

// Journal Entries CRUD
router.post('/journal-entries', authenticateToken, checkPermission('journal.create'), auditLog('CREATE', 'journal_entries'), createJournalEntry);
router.get('/journal-entries', authenticateToken, checkPermission('journal.create'), getJournalEntries);

export default router;