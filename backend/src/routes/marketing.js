import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import rbacMiddleware from '../../middleware/rbac.js';
import { 
  broadcastToAllCustomers, 
  broadcastToSegment,
  getCampaigns,
  createCampaign,
  getCampaign,
  getCampaignPerformance
} from '../controllers/marketingController.js';

const router = express.Router();

// Apply RBAC middleware to all routes
router.use(authenticateToken, rbacMiddleware);

// Broadcast marketing messages
router.post('/broadcast/all', broadcastToAllCustomers);
router.post('/broadcast/segment', broadcastToSegment);

// Campaign tracking
router.get('/campaigns', getCampaigns);
router.post('/campaigns', createCampaign);
// More specific route must come before the general :id route
router.get('/campaigns/:id/performance', getCampaignPerformance);
router.get('/campaigns/:id', getCampaign);

export default router;