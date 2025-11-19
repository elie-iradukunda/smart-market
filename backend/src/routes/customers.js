import express from 'express';
import { 
  createCustomer, 
  getCustomers, 
  getCustomer, 
  updateCustomer, 
  deleteCustomer,
  createLead,
  getLeads,
  getLead,
  updateLead,
  deleteLead
} from '../controllers/customerController.js';
import { authenticateToken, checkPermission } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';

const router = express.Router();

// Customer CRUD routes
router.post('/customers', authenticateToken, checkPermission('customer.create'), auditLog('CREATE', 'customers'), createCustomer);
router.get('/customers', authenticateToken, checkPermission('customer.view'), getCustomers);
router.get('/customers/:id', authenticateToken, checkPermission('customer.view'), getCustomer);
router.put('/customers/:id', authenticateToken, checkPermission('customer.create'), auditLog('UPDATE', 'customers'), updateCustomer);
router.delete('/customers/:id', authenticateToken, checkPermission('customer.create'), auditLog('DELETE', 'customers'), deleteCustomer);

// Lead CRUD routes
router.post('/leads', authenticateToken, checkPermission('lead.create'), auditLog('CREATE', 'leads'), createLead);
router.get('/leads', authenticateToken, checkPermission('lead.create'), getLeads);
router.get('/leads/:id', authenticateToken, checkPermission('lead.create'), getLead);
router.put('/leads/:id', authenticateToken, checkPermission('lead.create'), auditLog('UPDATE', 'leads'), updateLead);
router.delete('/leads/:id', authenticateToken, checkPermission('lead.create'), auditLog('DELETE', 'leads'), deleteLead);

export default router;