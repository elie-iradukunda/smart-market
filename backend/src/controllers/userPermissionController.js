import pool from '../config/database.js';

// Get all permissions for a specific user (role + custom)
export const getUserPermissions = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Get role-based permissions
    const [rolePermissions] = await pool.execute(`
      SELECT DISTINCT p.id, p.code, p.description, 'role' as source
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      JOIN users u ON u.role_id = rp.role_id
      WHERE u.id = ?
      ORDER BY p.code
    `, [user_id]);

    // Get custom user permissions
    const [customPermissions] = await pool.execute(`
      SELECT p.id, p.code, p.description, 'custom' as source, up.expires_at, up.granted_by, up.granted_at
      FROM user_permissions up
      JOIN permissions p ON up.permission_id = p.id
      WHERE up.user_id = ? AND (up.expires_at IS NULL OR up.expires_at > NOW())
      ORDER BY p.code
    `, [user_id]);

    // Combine and deduplicate (custom permissions take precedence)
    const permissionMap = new Map();
    
    // Add role permissions first
    rolePermissions.forEach(perm => {
      permissionMap.set(perm.code, perm);
    });

    // Override/add custom permissions
    customPermissions.forEach(perm => {
      permissionMap.set(perm.code, perm);
    });

    res.json({
      user_id: parseInt(user_id),
      permissions: Array.from(permissionMap.values()),
      role_permissions_count: rolePermissions.length,
      custom_permissions_count: customPermissions.length,
      total_permissions_count: permissionMap.size
    });
  } catch (error) {
    console.error('Get user permissions error:', error);
    res.status(500).json({ error: 'Failed to fetch user permissions' });
  }
};

// Grant custom permission to a user
export const grantUserPermission = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { permission_id, expires_at } = req.body;
    const granted_by = req.user.id; // Admin who is granting the permission

    if (!permission_id) {
      return res.status(400).json({ error: 'Permission ID is required' });
    }

    // Check if user exists
    const [users] = await pool.execute('SELECT id FROM users WHERE id = ?', [user_id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if permission exists
    const [permissions] = await pool.execute('SELECT id FROM permissions WHERE id = ?', [permission_id]);
    if (permissions.length === 0) {
      return res.status(404).json({ error: 'Permission not found' });
    }

    // Insert or update user permission
    await pool.execute(`
      INSERT INTO user_permissions (user_id, permission_id, granted_by, expires_at)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        granted_by = VALUES(granted_by),
        granted_at = CURRENT_TIMESTAMP,
        expires_at = VALUES(expires_at)
    `, [user_id, permission_id, granted_by, expires_at || null]);

    res.status(201).json({ message: 'Permission granted successfully' });
  } catch (error) {
    console.error('Grant user permission error:', error);
    res.status(500).json({ error: 'Failed to grant permission' });
  }
};

// Revoke custom permission from a user
export const revokeUserPermission = async (req, res) => {
  try {
    const { user_id, permission_id } = req.params;

    const [result] = await pool.execute(
      'DELETE FROM user_permissions WHERE user_id = ? AND permission_id = ?',
      [user_id, permission_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User permission not found' });
    }

    res.json({ message: 'Permission revoked successfully' });
  } catch (error) {
    console.error('Revoke user permission error:', error);
    res.status(500).json({ error: 'Failed to revoke permission' });
  }
};

// Grant multiple permissions to a user
export const grantUserPermissions = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { permission_ids, expires_at } = req.body;
    const granted_by = req.user.id;

    if (!Array.isArray(permission_ids) || permission_ids.length === 0) {
      return res.status(400).json({ error: 'Permission IDs array is required' });
    }

    // Check if user exists
    const [users] = await pool.execute('SELECT id FROM users WHERE id = ?', [user_id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate all permissions exist
    const placeholders = permission_ids.map(() => '?').join(',');
    const [permissions] = await pool.execute(
      `SELECT id FROM permissions WHERE id IN (${placeholders})`,
      permission_ids
    );

    if (permissions.length !== permission_ids.length) {
      return res.status(400).json({ error: 'One or more permissions not found' });
    }

    // Insert permissions
    for (const permission_id of permission_ids) {
      await pool.execute(`
        INSERT INTO user_permissions (user_id, permission_id, granted_by, expires_at)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          granted_by = VALUES(granted_by),
          granted_at = CURRENT_TIMESTAMP,
          expires_at = VALUES(expires_at)
      `, [user_id, permission_id, granted_by, expires_at || null]);
    }

    res.status(201).json({ 
      message: `${permission_ids.length} permissions granted successfully`,
      granted_count: permission_ids.length
    });
  } catch (error) {
    console.error('Grant user permissions error:', error);
    res.status(500).json({ error: 'Failed to grant permissions' });
  }
};

// Revoke all custom permissions from a user
export const revokeAllUserPermissions = async (req, res) => {
  try {
    const { user_id } = req.params;

    const [result] = await pool.execute(
      'DELETE FROM user_permissions WHERE user_id = ?',
      [user_id]
    );

    res.json({ 
      message: 'All custom permissions revoked successfully',
      revoked_count: result.affectedRows
    });
  } catch (error) {
    console.error('Revoke all user permissions error:', error);
    res.status(500).json({ error: 'Failed to revoke permissions' });
  }
};

