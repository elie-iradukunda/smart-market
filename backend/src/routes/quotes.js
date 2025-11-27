import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import rbacMiddleware from '../../middleware/rbac.js';
import { createQuote, getQuotes, getQuote, updateQuote } from '../controllers/quotesController.js';

const router = express.Router();

router.use(authenticateToken, rbacMiddleware);

// Quote routes
router.get('/quotes', getQuotes);
router.post('/quotes', createQuote);
router.get('/quotes/:id', getQuote);
router.put('/quotes/:id', updateQuote);

export default router;