import express from 'express';
import { 
  getDemandPredictions, 
  getReorderSuggestions, 
  getCustomerInsights
} from '../controllers/aiController.js';
import { authenticateToken, checkPermission } from '../middleware/auth.js';
import pool from '../config/database.js';

const router = express.Router();

// AI Prediction Views (Read-Only)
router.get('/predictions/demand', authenticateToken, checkPermission('ai.view'), getDemandPredictions);
router.get('/reorder-suggestions', authenticateToken, checkPermission('ai.view'), getReorderSuggestions);
router.get('/customer-insights', authenticateToken, checkPermission('ai.view'), getCustomerInsights);

// Get churn predictions
router.get('/predictions/churn', authenticateToken, checkPermission('ai.view'), async (req, res) => {
  try {
    const [churn] = await pool.execute(
      'SELECT ap.*, c.name as customer_name FROM ai_predictions ap JOIN customers c ON ap.target_id = c.id WHERE ap.type = "churn" ORDER BY ap.predicted_value DESC LIMIT 50'
    );
    res.json(churn);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch churn predictions' });
  }
});

// Get customer segments
router.get('/predictions/segments', authenticateToken, checkPermission('ai.view'), async (req, res) => {
  try {
    const [segments] = await pool.execute(
      'SELECT ap.*, c.name as customer_name FROM ai_predictions ap JOIN customers c ON ap.target_id = c.id WHERE ap.type = "segment" ORDER BY ap.created_at DESC LIMIT 100'
    );
    res.json(segments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch segments' });
  }
});

// Get pricing predictions
router.get('/predictions/pricing', authenticateToken, checkPermission('ai.view'), async (req, res) => {
  try {
    const [pricing] = await pool.execute(
      'SELECT * FROM ai_predictions WHERE type = "pricing" ORDER BY created_at DESC LIMIT 50'
    );
    res.json(pricing);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pricing predictions' });
  }
});

export default router;