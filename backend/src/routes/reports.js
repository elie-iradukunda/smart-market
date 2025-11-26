import express from 'express';
import { getSalesReport, getInventoryReport, getFinancialReport, getProductionReport } from '../controllers/reportController.js';
import { authenticateToken } from '../middleware/auth.js';
import rbacMiddleware from '../../middleware/rbac.js';

const router = express.Router();

// Apply RBAC middleware to all routes
router.use(authenticateToken, rbacMiddleware);

router.get('/reports/sales', getSalesReport);
router.get('/reports/inventory', getInventoryReport);
router.get('/reports/financial', getFinancialReport);
router.get('/reports/production', getProductionReport);

export default router;