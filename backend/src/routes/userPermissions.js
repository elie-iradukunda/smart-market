import express from 'express';
import {
  getUserPermissions,
  grantUserPermission,
  revokeUserPermission,
  grantUserPermissions,
  revokeAllUserPermissions
} from '../controllers/userPermissionController.js';
import { authenticateToken } from '../middleware/auth.js';
import rbacMiddleware from '../../middleware/rbac.js';

const router = express.Router();

// All routes require authentication and admin permissions
router.use(authenticateToken);

// Check if user is admin/owner (bypass RBAC for these routes since they're admin-only)
router.use((req, res, next) => {
  const user = req.user;
  if (user.role_id === 1 || user.is_super_admin) {
    return next();
  }
  return res.status(403).json({ error: 'Admin access required' });
});

// User permission routes
router.get('/users/:user_id/permissions', getUserPermissions);
router.post('/users/:user_id/permissions', grantUserPermission);
router.post('/users/:user_id/permissions/bulk', grantUserPermissions);
router.delete('/users/:user_id/permissions/:permission_id', revokeUserPermission);
router.delete('/users/:user_id/permissions', revokeAllUserPermissions);

export default router;

