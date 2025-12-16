import express from 'express';
import { getSalesReport, getInventoryReport, getFinancialReport, getProductionReport } from '../controllers/reportController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware only (permissions checked on frontend)
router.use(authenticateToken);

router.get('/reports/sales', getSalesReport);
router.get('/reports/inventory', getInventoryReport);
router.get('/reports/financial', getFinancialReport);
router.get('/reports/production', getProductionReport);

export default router;