import express from 'express';
import { createInvoice, recordPayment, createPOSSale, createJournalEntry } from '../controllers/financeController.js';
import { authenticateToken, checkPermission } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';

const router = express.Router();

router.post('/invoices', authenticateToken, checkPermission('invoice.create'), auditLog('CREATE', 'invoices'), createInvoice);
router.post('/payments', authenticateToken, checkPermission('payment.create'), auditLog('CREATE', 'payments'), recordPayment);
router.post('/pos-sales', authenticateToken, checkPermission('pos.create'), auditLog('CREATE', 'pos_sales'), createPOSSale);
router.post('/journal-entries', authenticateToken, checkPermission('journal.create'), auditLog('CREATE', 'journal_entries'), createJournalEntry);

export default router;