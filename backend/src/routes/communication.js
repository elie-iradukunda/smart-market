import express from 'express';
import { createConversation, getConversations, sendMessage, receiveMessage, getMessages, updateConversationStatus } from '../controllers/communicationController.js';
import { authenticateToken, checkPermission } from '../middleware/auth.js';

const router = express.Router();

router.post('/conversations', authenticateToken, checkPermission('conversation.create'), createConversation);
router.get('/conversations', authenticateToken, checkPermission('conversation.view'), getConversations);
router.post('/messages/send', authenticateToken, checkPermission('message.send'), sendMessage);
router.post('/messages/receive', receiveMessage); // Webhook endpoint, no auth
router.get('/conversations/:conversation_id/messages', authenticateToken, checkPermission('message.view'), getMessages);
router.put('/conversations/:conversation_id/status', authenticateToken, checkPermission('conversation.view'), updateConversationStatus);

export default router;