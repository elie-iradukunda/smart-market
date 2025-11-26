import express from 'express';
import { processLanariPayment, checkPaymentStatus } from '../controllers/financeController.js';
import { authenticateToken, checkPermission } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';

const router = express.Router();

router.post('/lanari', authenticateToken, checkPermission('payment.create'), auditLog('CREATE', 'payments'), processLanariPayment);
router.get('/:payment_id/status', authenticateToken, checkPermission('payment.view'), checkPaymentStatus);

export default router;