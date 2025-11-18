import express from 'express';
import { createCustomer, getCustomers, createLead } from '../controllers/customerController.js';
import { authenticateToken, checkPermission } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';

const router = express.Router();

router.post('/customers', authenticateToken, checkPermission('customer.create'), auditLog('CREATE', 'customers'), createCustomer);
router.get('/customers', authenticateToken, checkPermission('customer.view'), getCustomers);
router.post('/leads', authenticateToken, checkPermission('lead.create'), auditLog('CREATE', 'leads'), createLead);

export default router;