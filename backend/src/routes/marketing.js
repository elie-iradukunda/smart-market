import express from 'express';
import { createCampaign, getCampaigns, getCampaignById, recordAdPerformance, getCampaignPerformance } from '../controllers/marketingController.js';
import { authenticateToken, checkPermission } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';

const router = express.Router();

router.post('/campaigns', authenticateToken, checkPermission('campaign.create'), auditLog('CREATE', 'campaigns'), createCampaign);
router.get('/campaigns', authenticateToken, checkPermission('campaign.view'), getCampaigns);
router.get('/campaigns/:id', authenticateToken, checkPermission('campaign.view'), getCampaignById);
router.post('/ad-performance', authenticateToken, checkPermission('campaign.update'), recordAdPerformance);
router.get('/campaigns/:id/performance', authenticateToken, checkPermission('campaign.view'), getCampaignPerformance);

export default router;