import express from 'express';
import { createQuote, approveQuote, getOrders } from '../controllers/orderController.js';
import { authenticateToken, checkPermission } from '../middleware/auth.js';

const router = express.Router();

router.post('/quotes', authenticateToken, checkPermission('quote.create'), createQuote);
router.put('/quotes/:id/approve', authenticateToken, checkPermission('quote.approve'), approveQuote);
router.get('/orders', authenticateToken, checkPermission('order.view'), getOrders);

export default router;