import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import rbacMiddleware from '../../middleware/rbac.js';
import { 
  broadcastToAllCustomers, 
  broadcastToSegment,
  getCampaigns,
  getCampaign
} from '../controllers/marketingController.js';

const router = express.Router();

// Apply RBAC middleware to all routes
router.use(authenticateToken, rbacMiddleware);

// Broadcast marketing messages
router.post('/broadcast/all', broadcastToAllCustomers);
router.post('/broadcast/segment', broadcastToSegment);

// Campaign tracking
router.get('/campaigns', getCampaigns);
router.get('/campaigns/:id', getCampaign);

export default router;