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

// BOM Templates (Bill of Materials)
import pool from '../config/database.js';

router.get('/bom-templates', async (req, res) => {
  try {
    const [templates] = await pool.execute(`
      SELECT bt.*, 
        (SELECT GROUP_CONCAT(m.name SEPARATOR ', ') 
         FROM bom_template_items bti 
         JOIN materials m ON bti.material_id = m.id 
         WHERE bti.template_id = bt.id) as materials
      FROM bom_templates bt
      ORDER BY bt.name
    `);
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch BOM templates' });
  }
});

router.get('/bom-templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [template] = await pool.execute('SELECT * FROM bom_templates WHERE id = ?', [id]);
    if (template.length === 0) {
      return res.status(404).json({ error: 'BOM template not found' });
    }
    
    const [items] = await pool.execute(`
      SELECT bti.*, m.name as material_name, m.sku, m.unit
      FROM bom_template_items bti
      JOIN materials m ON bti.material_id = m.id
      WHERE bti.template_id = ?
    `, [id]);
    
    res.json({ ...template[0], items });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch BOM template' });
  }
});

router.post('/bom-templates', auditLog('CREATE', 'bom_templates'), async (req, res) => {
  try {
    const { code, name, description, items } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO bom_templates (code, name, description) VALUES (?, ?, ?)',
      [code, name, description || null]
    );
    const templateId = result.insertId;
    
    if (items && items.length > 0) {
      for (const item of items) {
        await pool.execute(
          'INSERT INTO bom_template_items (template_id, material_id, quantity) VALUES (?, ?, ?)',
          [templateId, item.material_id, item.quantity]
        );
      }
    }
    
    res.status(201).json({ id: templateId, message: 'BOM template created' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create BOM template' });
  }
});

router.put('/bom-templates/:id', auditLog('UPDATE', 'bom_templates'), async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, description, items } = req.body;
    
    await pool.execute(
      'UPDATE bom_templates SET code = ?, name = ?, description = ? WHERE id = ?',
      [code, name, description || null, id]
    );
    
    if (items) {
      await pool.execute('DELETE FROM bom_template_items WHERE template_id = ?', [id]);
      for (const item of items) {
        await pool.execute(
          'INSERT INTO bom_template_items (template_id, material_id, quantity) VALUES (?, ?, ?)',
          [id, item.material_id, item.quantity]
        );
      }
    }
    
    res.json({ message: 'BOM template updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update BOM template' });
  }
});

router.delete('/bom-templates/:id', auditLog('DELETE', 'bom_templates'), async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM bom_template_items WHERE template_id = ?', [id]);
    await pool.execute('DELETE FROM bom_templates WHERE id = ?', [id]);
    res.json({ message: 'BOM template deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete BOM template' });
  }
});

export default router;