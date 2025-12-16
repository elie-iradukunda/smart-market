import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import pool from '../config/database.js';

const router = express.Router();

// Get current user profile with permissions (no RBAC needed - user can always access own profile)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    let permissions = [];

    // Owner (role_id = 1) gets all permissions
    if (req.user.role_id === 1) {
      const [allPerms] = await pool.execute('SELECT code FROM permissions ORDER BY code');
      permissions = allPerms.map(p => p.code);
    } else {
      // Get user's permissions from role_permissions table
      const [rolePerms] = await pool.execute(`
        SELECT p.code
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = ?
        ORDER BY p.code
      `, [req.user.role_id]);
      permissions = rolePerms.map(p => p.code);
    }

    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      role_id: req.user.role_id,
      permissions: permissions
    });
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

export default router;