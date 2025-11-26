import express from 'express';
import { createWorkOrder, getWorkOrders, getWorkOrder, updateWorkOrder, logWork, getWorkLogs, updateOrderStatus, issueOrderMaterials } from '../controllers/productionController.js';
import { authenticateToken } from '../middleware/auth.js';
import rbacMiddleware from '../../middleware/rbac.js';
import { auditLog } from '../middleware/audit.js';

const router = express.Router();

// Apply RBAC middleware to all routes
router.use(authenticateToken, rbacMiddleware);

router.post('/work-orders', auditLog('CREATE', 'work_orders'), createWorkOrder);
router.get('/work-orders', getWorkOrders);
router.get('/work-orders/:id', getWorkOrder);
router.put('/work-orders/:id', auditLog('UPDATE', 'work_orders'), updateWorkOrder);
router.post('/work-logs', auditLog('CREATE', 'work_logs'), logWork);
router.get('/work-logs', getWorkLogs);
router.put('/orders/:id/status', auditLog('UPDATE', 'orders'), updateOrderStatus);
router.post('/orders/:id/issue-materials', auditLog('CREATE', 'stock_movements'), issueOrderMaterials);

export default router;