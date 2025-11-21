import express from 'express';
import { authenticateToken, checkPermission } from '../middleware/auth.js';
import {
  sendEmail,
  sendSMS,
  sendSlack,
  sendDiscord,
  sendUnifiedNotification,
  sendAlert,
  testCommunications
} from '../controllers/communicationController.js';

const router = express.Router();

// Free communication endpoints
router.post('/email', authenticateToken, checkPermission('communication.send'), sendEmail);
router.post('/sms', authenticateToken, checkPermission('communication.send'), sendSMS);
router.post('/slack', authenticateToken, checkPermission('communication.send'), sendSlack);
router.post('/discord', authenticateToken, checkPermission('communication.send'), sendDiscord);
router.post('/notify', authenticateToken, checkPermission('communication.send'), sendUnifiedNotification);
router.post('/alert', authenticateToken, checkPermission('communication.send'), sendAlert);

// Test endpoint (no auth required)
router.get('/test', testCommunications);

// Add permissions endpoint
import { addCommunicationPermissions } from '../controllers/permissionController.js';
router.post('/add-permissions', addCommunicationPermissions);

export default router;