import express from 'express';
import { 
  createRole, getRoles, getRole, updateRole, deleteRole,
  createPermission, getPermissions, getPermission, updatePermission, deletePermission,
  createRolePermission, getRolePermissions, getAllRolePermissions, updateRolePermissions, deleteRolePermission
} from '../controllers/roleController.js';
import { authenticateToken, checkPermission } from '../middleware/auth.js';
import { auditLog } from '../middleware/audit.js';
import pool from '../config/database.js';

const router = express.Router();

// ROLES CRUD
router.post('/roles', authenticateToken, checkPermission('user.create'), auditLog('CREATE', 'roles'), createRole);
router.get('/roles', authenticateToken, checkPermission('user.view'), getRoles);
router.get('/roles/:id', authenticateToken, checkPermission('user.view'), getRole);
router.put('/roles/:id', authenticateToken, checkPermission('user.update'), auditLog('UPDATE', 'roles'), updateRole);
router.delete('/roles/:id', authenticateToken, checkPermission('user.delete'), auditLog('DELETE', 'roles'), deleteRole);

// PERMISSIONS CRUD
router.post('/permissions', authenticateToken, checkPermission('user.create'), auditLog('CREATE', 'permissions'), createPermission);
router.get('/permissions', authenticateToken, checkPermission('user.view'), getPermissions);
router.get('/permissions/:id', authenticateToken, checkPermission('user.view'), getPermission);
router.put('/permissions/:id', authenticateToken, checkPermission('user.update'), auditLog('UPDATE', 'permissions'), updatePermission);
router.delete('/permissions/:id', authenticateToken, checkPermission('user.delete'), auditLog('DELETE', 'permissions'), deletePermission);

// ROLE PERMISSIONS CRUD
router.post('/role-permissions', authenticateToken, checkPermission('user.create'), auditLog('CREATE', 'role_permissions'), createRolePermission);
router.get('/role-permissions', authenticateToken, checkPermission('user.view'), getAllRolePermissions);
router.get('/roles/:role_id/permissions', authenticateToken, checkPermission('user.view'), getRolePermissions);
router.put('/roles/:role_id/permissions', authenticateToken, checkPermission('user.update'), auditLog('UPDATE', 'role_permissions'), updateRolePermissions);
router.delete('/roles/:role_id/permissions/:permission_id', authenticateToken, checkPermission('user.delete'), auditLog('DELETE', 'role_permissions'), deleteRolePermission);

// AUDIT LOGS
router.get('/audit-logs', authenticateToken, checkPermission('audit.view'), async (req, res) => {
  try {
    const [logs] = await pool.execute(`
      SELECT al.id, u.name as user_name, al.action, al.table_name, al.timestamp
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.timestamp DESC
      LIMIT 200
    `);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

export default router;