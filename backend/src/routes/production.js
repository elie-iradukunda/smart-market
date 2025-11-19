import express from 'express';
import { createWorkOrder, getWorkOrders, getWorkOrder, updateWorkOrder, logWork, getWorkLogs, updateOrderStatus } from '../controllers/productionController.js';
import { authenticateToken, checkPermission } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';

const router = express.Router();

router.post('/work-orders', authenticateToken, checkPermission('workorder.create'), auditLog('CREATE', 'work_orders'), createWorkOrder);
router.get('/work-orders', authenticateToken, checkPermission('workorder.view'), getWorkOrders);
router.get('/work-orders/:id', authenticateToken, checkPermission('workorder.view'), getWorkOrder);
router.put('/work-orders/:id', authenticateToken, checkPermission('workorder.update'), auditLog('UPDATE', 'work_orders'), updateWorkOrder);
router.post('/work-logs', authenticateToken, checkPermission('worklog.create'), auditLog('CREATE', 'work_logs'), logWork);
router.get('/work-logs', authenticateToken, checkPermission('workorder.view'), getWorkLogs);
router.put('/orders/:id/status', authenticateToken, checkPermission('order.update'), auditLog('UPDATE', 'orders'), updateOrderStatus);

export default router;