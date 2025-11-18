import express from 'express';
import { createPrediction, getDemandPredictions, getReorderSuggestions, getCustomerInsights } from '../controllers/aiController.js';
import { authenticateToken, checkPermission } from '../middleware/auth.js';

const router = express.Router();

router.post('/predictions', authenticateToken, checkPermission('ai.create'), createPrediction);
router.get('/predictions/demand', authenticateToken, checkPermission('ai.view'), getDemandPredictions);
router.get('/reorder-suggestions', authenticateToken, checkPermission('ai.view'), getReorderSuggestions);
router.get('/customer-insights', authenticateToken, checkPermission('ai.view'), getCustomerInsights);

export default router;