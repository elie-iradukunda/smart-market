import express from 'express';
import { getOrders, getOrder, getOrdersReadyForCommunication } from '../controllers/orderController.js';
import { authenticateToken } from '../middleware/auth.js';
import rbacMiddleware from '../../middleware/rbac.js';
import { auditLog } from '../middleware/audit.js';

const router = express.Router();

// Apply RBAC middleware to all routes
router.use(authenticateToken, rbacMiddleware);

// Order routes
router.get('/orders', getOrders);
router.get('/orders/ready-for-communication', getOrdersReadyForCommunication);
router.get('/orders/:id', getOrder);

export default router;