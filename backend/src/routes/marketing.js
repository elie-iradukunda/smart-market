import express from 'express';
import { authenticateToken, checkPermission } from '../middleware/auth.js';
import { 
  broadcastToAllCustomers, 
  broadcastToSegment,
  getCampaigns,
  getCampaign
} from '../controllers/marketingController.js';

const router = express.Router();

// Broadcast marketing messages
router.post('/broadcast/all', authenticateToken, checkPermission('campaign.create'), broadcastToAllCustomers);
router.post('/broadcast/segment', authenticateToken, checkPermission('campaign.create'), broadcastToSegment);

// Campaign tracking
router.get('/campaigns', authenticateToken, checkPermission('campaign.view'), getCampaigns);
router.get('/campaigns/:id', authenticateToken, checkPermission('campaign.view'), getCampaign);

export default router;