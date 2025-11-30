import express from 'express';
import { 
  login, 
  register,
  createUser, 
  getUsers, 
  getUser, 
  updateUser, 
  deleteUser, 
  changePassword,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';

import { authenticateToken } from '../middleware/auth.js';
import rbacMiddleware from '../../middleware/rbac.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes with RBAC
router.use(authenticateToken, rbacMiddleware);

// User CRUD routes
router.post('/users', createUser);
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/password', changePassword);
router.put('/users/{id}/password', changePassword);

export default router;