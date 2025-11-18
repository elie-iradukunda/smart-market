import express from 'express';
import { createMaterial, getMaterials, createStockMovement, createPurchaseOrder } from '../controllers/inventoryController.js';
import { authenticateToken, checkPermission } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';

const router = express.Router();

router.post('/materials', authenticateToken, checkPermission('material.create'), auditLog('CREATE', 'materials'), createMaterial);
router.get('/materials', authenticateToken, checkPermission('material.view'), getMaterials);
router.post('/stock-movements', authenticateToken, checkPermission('stock.move'), auditLog('CREATE', 'stock_movements'), createStockMovement);
router.post('/purchase-orders', authenticateToken, checkPermission('po.create'), auditLog('CREATE', 'purchase_orders'), createPurchaseOrder);

export default router;