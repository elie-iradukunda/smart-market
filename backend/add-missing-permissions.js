import mysql from 'mysql2/promise';

async function addMissingPermissions() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'smart_market'
  });

  try {
    // Add missing po.view permission
    console.log('Adding missing po.view permission...');
    await connection.execute(
      'INSERT IGNORE INTO permissions (code, description) VALUES (?, ?)',
      ['po.view', 'View purchase orders']
    );

    // Get the new permission ID
    const [newPerm] = await connection.execute(
      'SELECT id FROM permissions WHERE code = ?',
      ['po.view']
    );

    if (newPerm.length > 0) {
      // Add this permission to Admin role (role_id = 1)
      await connection.execute(
        'INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
        [1, newPerm[0].id]
      );
      console.log('Added po.view permission to Admin role');

      // Also add to Controller role (role_id = 6) since they handle purchase orders
      await connection.execute(
        'INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
        [6, newPerm[0].id]
      );
      console.log('Added po.view permission to Controller role');
    }

    // Verify all permissions for role 1
    const [rolePerms] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM role_permissions 
      WHERE role_id = 1
    `);
    console.log(`Role 1 now has ${rolePerms[0].count} permissions`);

    // Check if po.view and po.create are both assigned to role 1
    const [poPerms] = await connection.execute(`
      SELECT p.code, p.description 
      FROM role_permissions rp 
      JOIN permissions p ON rp.permission_id = p.id 
      WHERE rp.role_id = 1 AND p.code LIKE 'po.%'
      ORDER BY p.code
    `);
    console.log('Purchase order permissions for role 1:');
    poPerms.forEach(p => console.log(`- ${p.code}: ${p.description}`));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

addMissingPermissions();