import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import rbacMiddleware from '../../middleware/rbac.js';
import { createQuote, getQuotes, getQuote, updateQuote, approveQuote } from '../controllers/quotesController.js';

const router = express.Router();

router.use(authenticateToken, rbacMiddleware);

// Quote routes
router.get('/quotes', getQuotes);
router.post('/quotes', createQuote);
router.get('/quotes/:id', getQuote);
router.put('/quotes/:id', updateQuote);
router.put('/quotes/:id/approve', approveQuote);

export default router;