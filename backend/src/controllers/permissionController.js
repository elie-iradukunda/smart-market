import pool from '../config/database.js';

export const addCommunicationPermissions = async (req, res) => {
  try {
    const permissions = [
      'communication.send',
      'communication.view', 
      'communication.manage'
    ];
    
    for (const permission of permissions) {
      // Insert permission if not exists
      await pool.execute(
        'INSERT IGNORE INTO permissions (code, description) VALUES (?, ?)',
        [permission, `Communication permission: ${permission}`]
      );
      
      // Get permission ID
      const [permResult] = await pool.execute(
        'SELECT id FROM permissions WHERE code = ?',
        [permission]
      );
      
      if (permResult.length > 0) {
        // Add to admin role if not exists
        await pool.execute(
          'INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (1, ?)',
          [permResult[0].id]
        );
      }
    }
    
    // Get all communication permissions for admin role
    const [result] = await pool.execute(`
      SELECT p.code, p.description, r.name as role_name 
      FROM role_permissions rp 
      JOIN permissions p ON rp.permission_id = p.id
      JOIN roles r ON rp.role_id = r.id 
      WHERE rp.role_id = 1 AND p.code LIKE 'communication.%'
    `);
    
    res.json({
      success: true,
      message: 'Communication permissions added to Admin role',
      permissions: result
    });
    
  } catch (error) {
    console.error('Permission error:', error);
    res.status(500).json({ error: 'Failed to add permissions' });
  }
};