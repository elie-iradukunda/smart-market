import express from 'express';
import { getOrders, getOrder, getOrdersReadyForCommunication } from '../controllers/orderController.js';
import { authenticateToken } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';

const router = express.Router();

// Apply authentication middleware only (permissions checked on frontend)
router.use(authenticateToken);

// Order routes
router.get('/orders', getOrders);
router.get('/orders/ready-for-communication', getOrdersReadyForCommunication);
router.get('/orders/:id', getOrder);

export default router;