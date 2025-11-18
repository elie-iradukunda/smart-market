import express from 'express';
import { login, createUser } from '../controllers/authController.js';
import { authenticateToken, checkPermission } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/users', authenticateToken, checkPermission('user.create'), createUser);

export default router;