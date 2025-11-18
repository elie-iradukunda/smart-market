import express from 'express';
import { getSalesReport, getInventoryReport, getFinancialReport, getProductionReport } from '../controllers/reportController.js';
import { authenticateToken, checkPermission } from '../middleware/auth.js';

const router = express.Router();

router.get('/reports/sales', authenticateToken, checkPermission('report.view'), getSalesReport);
router.get('/reports/inventory', authenticateToken, checkPermission('report.view'), getInventoryReport);
router.get('/reports/financial', authenticateToken, checkPermission('report.view'), getFinancialReport);
router.get('/reports/production', authenticateToken, checkPermission('report.view'), getProductionReport);

export default router;