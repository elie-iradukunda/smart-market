import express from 'express';
import { 
  createRole, getRoles, getRole, updateRole, deleteRole,
  createPermission, getPermissions, getPermission, updatePermission, deletePermission,
  createRolePermission, getRolePermissions, getAllRolePermissions, updateRolePermissions, deleteRolePermission
} from '../controllers/roleController.js';
import { authenticateToken, checkPermission } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';

const router = express.Router();

// ROLES CRUD
router.post('/roles', authenticateToken, checkPermission('user.create'), auditLog('CREATE', 'roles'), createRole);
router.get('/roles', authenticateToken, checkPermission('user.view'), getRoles);
router.get('/roles/:id', authenticateToken, checkPermission('user.view'), getRole);
router.put('/roles/:id', authenticateToken, checkPermission('user.create'), auditLog('UPDATE', 'roles'), updateRole);
router.delete('/roles/:id', authenticateToken, checkPermission('user.create'), auditLog('DELETE', 'roles'), deleteRole);

// PERMISSIONS CRUD
router.post('/permissions', authenticateToken, checkPermission('user.create'), auditLog('CREATE', 'permissions'), createPermission);
router.get('/permissions', authenticateToken, checkPermission('user.view'), getPermissions);
router.get('/permissions/:id', authenticateToken, checkPermission('user.view'), getPermission);
router.put('/permissions/:id', authenticateToken, checkPermission('user.create'), auditLog('UPDATE', 'permissions'), updatePermission);
router.delete('/permissions/:id', authenticateToken, checkPermission('user.create'), auditLog('DELETE', 'permissions'), deletePermission);

// ROLE PERMISSIONS CRUD
router.post('/role-permissions', authenticateToken, checkPermission('user.create'), auditLog('CREATE', 'role_permissions'), createRolePermission);
router.get('/role-permissions', authenticateToken, checkPermission('user.view'), getAllRolePermissions);
router.get('/roles/:role_id/permissions', authenticateToken, checkPermission('user.view'), getRolePermissions);
router.put('/roles/:role_id/permissions', authenticateToken, checkPermission('user.create'), auditLog('UPDATE', 'role_permissions'), updateRolePermissions);
router.delete('/roles/:role_id/permissions/:permission_id', authenticateToken, checkPermission('user.create'), auditLog('DELETE', 'role_permissions'), deleteRolePermission);

export default router;