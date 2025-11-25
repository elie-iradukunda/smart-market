import express from 'express';
import { 
  login, 
  createUser, 
  getUsers, 
  getUser, 
  updateUser, 
  deleteUser, 
  changePassword,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';

import { authenticateToken, checkPermission } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// User CRUD routes
// View/list users requires user.view; create/update/delete require user.manage
router.post('/users', authenticateToken, checkPermission('user.create'), createUser);
router.get('/users', authenticateToken, checkPermission('user.view'), getUsers);
router.get('/users/:id', authenticateToken, checkPermission('user.view'), getUser);
router.put('/users/:id', authenticateToken, checkPermission('user.create'), updateUser);
router.delete('/users/:id', authenticateToken, checkPermission('user.create'), deleteUser);

router.put('/users/:id/password', authenticateToken, changePassword);

export default router;