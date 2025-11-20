import express from 'express';
import { 
  createConversation, 
  getConversations, 
  getConversation,
  getMessages, 
  sendMessage, 
  receiveMessage,
  closeConversation 
} from '../controllers/messageController.js';
import { authenticateToken, checkPermission } from '../middleware/auth.js';

const router = express.Router();

// Conversation management
router.post('/conversations', authenticateToken, checkPermission('conversation.create'), createConversation);
router.get('/conversations', authenticateToken, checkPermission('conversation.view'), getConversations);
router.get('/conversations/:id', authenticateToken, checkPermission('conversation.view'), getConversation);
router.put('/conversations/:id/close', authenticateToken, checkPermission('conversation.manage'), closeConversation);

// Message management
router.get('/conversations/:conversation_id/messages', authenticateToken, checkPermission('message.view'), getMessages);
router.post('/messages/send', authenticateToken, checkPermission('message.send'), sendMessage);

// Webhook for receiving messages (no auth - external services)
router.post('/messages/receive', receiveMessage);

export default router;