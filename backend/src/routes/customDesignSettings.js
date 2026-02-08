import express from 'express';
import { 
    getCustomDesignSettings, 
    getAllCustomDesignSettings,
    updateCustomDesignSetting, 
    createCustomDesignSetting, 
    deleteCustomDesignSetting 
} from '../controllers/customDesignSettingsController.js';
import { authenticateToken } from '../middleware/auth.js';
import rbacMiddleware from '../../middleware/rbac.js';

const router = express.Router();

// Public: Get active settings for the ordering page
router.get('/custom-design/settings', getCustomDesignSettings);

// Admin only: Manage settings
router.get('/custom-design/settings/all', authenticateToken, rbacMiddleware, getAllCustomDesignSettings);
router.post('/custom-design/settings', authenticateToken, rbacMiddleware, createCustomDesignSetting);
router.put('/custom-design/settings/:id', authenticateToken, rbacMiddleware, updateCustomDesignSetting);
router.delete('/custom-design/settings/:id', authenticateToken, rbacMiddleware, deleteCustomDesignSetting);

export default router;
