import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import rbacMiddleware from '../../middleware/rbac.js';
import {
  getAllAds,
  getAdsForManagement,
  getAd,
  createAd,
  updateAd,
  deleteAd,
  trackImpression,
  trackClick,
  toggleAdStatus
} from '../controllers/adsController.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/ads/public', getAllAds);
router.post('/ads/public/:id/impression', trackImpression);
router.post('/ads/public/:id/click', trackClick);

// Protected routes (require authentication and RBAC)
router.use(authenticateToken, rbacMiddleware);

router.get('/ads', getAdsForManagement);
router.get('/ads/:id', getAd);
router.post('/ads', createAd);
router.put('/ads/:id', updateAd);
router.delete('/ads/:id', deleteAd);
router.patch('/ads/:id/toggle', toggleAdStatus);

export default router;
