import express from 'express';
import { 
  createMaterial, getMaterials, getMaterial, updateMaterial, deleteMaterial,
  createStockMovement, getStockMovements,
  createPurchaseOrder, getPurchaseOrders, getPurchaseOrder, updatePurchaseOrder,
  createSupplier, getSuppliers, getSupplier, updateSupplier, deleteSupplier
} from '../controllers/inventoryController.js';
import { authenticateToken } from '../middleware/auth.js';
import rbacMiddleware from '../../middleware/rbac.js';
import { auditLog } from '../middleware/audit.js';

const router = express.Router();

// Apply RBAC middleware to all routes
router.use(authenticateToken, rbacMiddleware);

// Materials CRUD
router.post('/materials', auditLog('CREATE', 'materials'), createMaterial);
router.get('/materials', getMaterials);
router.get('/materials/:id', getMaterial);
router.put('/materials/:id', auditLog('UPDATE', 'materials'), updateMaterial);
router.delete('/materials/:id', auditLog('DELETE', 'materials'), deleteMaterial);

// Stock Movements
router.post('/stock-movements', auditLog('CREATE', 'stock_movements'), createStockMovement);
router.get('/stock-movements', getStockMovements);

// Purchase Orders CRUD
router.post('/purchase-orders', auditLog('CREATE', 'purchase_orders'), createPurchaseOrder);
router.get('/purchase-orders', getPurchaseOrders);
router.get('/purchase-orders/:id', getPurchaseOrder);
router.put('/purchase-orders/:id', auditLog('UPDATE', 'purchase_orders'), updatePurchaseOrder);

// Suppliers CRUD
router.post('/suppliers', auditLog('CREATE', 'suppliers'), createSupplier);
router.get('/suppliers', getSuppliers);
router.get('/suppliers/:id', getSupplier);
router.put('/suppliers/:id', auditLog('UPDATE', 'suppliers'), updateSupplier);
router.delete('/suppliers/:id', auditLog('DELETE', 'suppliers'), deleteSupplier);

export default router;