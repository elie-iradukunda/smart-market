import express from 'express';
import { processLanariPayment, checkPaymentStatus, getPayments } from '../controllers/financeController.js';
import { authenticateToken } from '../middleware/auth.js';
import rbacMiddleware from '../../middleware/rbac.js';
import { auditLog } from '../middleware/audit.js';
import pool from '../config/database.js';

const router = express.Router();

// Apply RBAC middleware to all routes
router.use(authenticateToken, rbacMiddleware);

router.get('/', getPayments);
router.post('/lanari', auditLog('CREATE', 'payments'), processLanariPayment);

// Refund payment
router.put('/:payment_id/refund', auditLog('UPDATE', 'payments'), async (req, res) => {
  try {
    const { payment_id } = req.params;
    const { reason } = req.body;
    
    // Get payment and customer details
    const [payment] = await pool.execute(`
      SELECT p.*, c.email, c.name as customer_name, i.id as invoice_id
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.id
      JOIN orders o ON i.order_id = o.id
      JOIN customers c ON o.customer_id = c.id
      WHERE p.id = ?
    `, [payment_id]);
    
    if (payment.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    // Update payment status to refunded
    await pool.execute(
      'UPDATE payments SET status = "refunded" WHERE id = ?',
      [payment_id]
    );
    
    // Send refund email to customer
    if (payment[0].email) {
      const { sendFreeEmail } = await import('../services/freeCommunicationService.js');
      await sendFreeEmail(
        payment[0].email,
        'Payment Refund Processed',
        `<h3>Hello ${payment[0].customer_name},</h3>
         <p>Your payment of ${payment[0].amount} has been refunded.</p>
         <p>Transaction ID: ${payment[0].gateway_transaction_id}</p>
         <p>Reason: ${reason || 'No reason provided'}</p>
         <p>The refund will appear in your account within 3-5 business days.</p>`
      );
    }
    
    res.json({ message: 'Payment refunded and customer notified' });
  } catch (error) {
    res.status(500).json({ error: 'Refund failed' });
  }
});

export default router;