import express from 'express';
import { 
  createMaterial, getMaterials, getMaterial, updateMaterial, deleteMaterial,
  createStockMovement, getStockMovements,
  createPurchaseOrder, getPurchaseOrders, getPurchaseOrder, updatePurchaseOrder,
  createSupplier, getSuppliers, getSupplier, updateSupplier, deleteSupplier
} from '../controllers/inventoryController.js';
import { authenticateToken, checkPermission } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';

const router = express.Router();

// Materials CRUD
router.post('/materials', authenticateToken, checkPermission('material.create'), auditLog('CREATE', 'materials'), createMaterial);
router.get('/materials', authenticateToken, checkPermission('material.view'), getMaterials);
router.get('/materials/:id', authenticateToken, checkPermission('material.view'), getMaterial);
router.put('/materials/:id', authenticateToken, checkPermission('material.create'), auditLog('UPDATE', 'materials'), updateMaterial);
router.delete('/materials/:id', authenticateToken, checkPermission('material.create'), auditLog('DELETE', 'materials'), deleteMaterial);

// Stock Movements
router.post('/stock-movements', authenticateToken, checkPermission('stock.move'), auditLog('CREATE', 'stock_movements'), createStockMovement);
router.get('/stock-movements', authenticateToken, checkPermission('stock.move'), getStockMovements);

// Purchase Orders CRUD
router.post('/purchase-orders', authenticateToken, checkPermission('po.create'), auditLog('CREATE', 'purchase_orders'), createPurchaseOrder);
router.get('/purchase-orders', authenticateToken, checkPermission('po.view'), getPurchaseOrders);
router.get('/purchase-orders/:id', authenticateToken, checkPermission('po.view'), getPurchaseOrder);
router.put('/purchase-orders/:id', authenticateToken, checkPermission('po.create'), auditLog('UPDATE', 'purchase_orders'), updatePurchaseOrder);

// Suppliers CRUD
router.post('/suppliers', authenticateToken, checkPermission('material.create'), auditLog('CREATE', 'suppliers'), createSupplier);
router.get('/suppliers', authenticateToken, checkPermission('material.view'), getSuppliers);
router.get('/suppliers/:id', authenticateToken, checkPermission('material.view'), getSupplier);
router.put('/suppliers/:id', authenticateToken, checkPermission('material.create'), auditLog('UPDATE', 'suppliers'), updateSupplier);
router.delete('/suppliers/:id', authenticateToken, checkPermission('material.create'), auditLog('DELETE', 'suppliers'), deleteSupplier);

export default router;