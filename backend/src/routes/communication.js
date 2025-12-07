import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import rbacMiddleware from '../../middleware/rbac.js';
import {
  sendEmail,
  sendContactForm,
  testCommunications
} from '../controllers/communicationController.js';
import { addCommunicationPermissions } from '../controllers/permissionController.js';

const router = express.Router();

// Public endpoints (no auth required)
router.get('/test', testCommunications);
router.post('/contact', sendContactForm);

// Add permissions endpoint (no auth required)
router.post('/add-permissions', addCommunicationPermissions);

// Protected routes
router.use(authenticateToken, rbacMiddleware);
router.post('/email', sendEmail);

export default router;