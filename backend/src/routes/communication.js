import express from 'express';
import { authenticateToken, checkPermission } from '../middleware/auth.js';
import {
  sendEmail,
  testCommunications
} from '../controllers/communicationController.js';
import { addCommunicationPermissions } from '../controllers/permissionController.js';

const router = express.Router();

// Email communication
router.post('/email', authenticateToken, checkPermission('communication.send'), sendEmail);

// Test endpoint (no auth required)
router.get('/test', testCommunications);

// Add permissions endpoint
router.post('/add-permissions', addCommunicationPermissions);

export default router;