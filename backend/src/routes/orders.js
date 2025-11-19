import express from 'express';
import { createQuote, getQuotes, getQuote, updateQuote, approveQuote, getOrders } from '../controllers/orderController.js';
import { authenticateToken, checkPermission } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';

const router = express.Router();

// Quote CRUD routes
router.post('/quotes', authenticateToken, checkPermission('quote.create'), auditLog('CREATE', 'quotes'), createQuote);
router.get('/quotes', authenticateToken, checkPermission('quote.create'), getQuotes);
router.get('/quotes/:id', authenticateToken, checkPermission('quote.create'), getQuote);
router.put('/quotes/:id', authenticateToken, checkPermission('quote.create'), auditLog('UPDATE', 'quotes'), updateQuote);
router.put('/quotes/:id/approve', authenticateToken, checkPermission('quote.approve'), approveQuote);

// Order routes
router.get('/orders', authenticateToken, checkPermission('order.view'), getOrders);

export default router;