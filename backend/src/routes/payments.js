import express from 'express';
import { processLanariPayment, checkPaymentStatus, getPayments } from '../controllers/financeController.js';
import { authenticateToken } from '../middleware/auth.js';
import rbacMiddleware from '../../middleware/rbac.js';
import { auditLog } from '../middleware/audit.js';

const router = express.Router();

// Apply RBAC middleware to all routes
router.use(authenticateToken, rbacMiddleware);

router.get('/', getPayments);
router.post('/lanari', auditLog('CREATE', 'payments'), processLanariPayment);
router.get('/:payment_id/status', checkPaymentStatus);

export default router;