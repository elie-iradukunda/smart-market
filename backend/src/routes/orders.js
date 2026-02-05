import express from 'express';
import { getOrders, getOrder, getOrdersReadyForCommunication, updateOrder, deleteOrder } from '../controllers/orderController.js';
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
router.put('/orders/:id/assign', auditLog('UPDATE', 'orders'), updateOrder);
router.put('/orders/:id', auditLog('UPDATE', 'orders'), updateOrder);
router.delete('/orders/:id', auditLog('DELETE', 'orders'), deleteOrder);

export default router;