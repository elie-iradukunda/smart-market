import mysql from 'mysql2/promise';

async function fixPermissions() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'smart_market'
  });

  try {
    // Check permissions table structure
    console.log('Checking permissions table structure...');
    const [columns] = await connection.execute('DESCRIBE permissions');
    console.log('Permissions table columns:', columns.map(c => c.Field));

    // Get all permissions
    const [allPerms] = await connection.execute('SELECT * FROM permissions ORDER BY id');
    console.log('\nAll permissions:', allPerms.length);
    allPerms.forEach(p => console.log(`- ID ${p.id}: ${p.code} - ${p.description}`));

    // Check current role permissions for role 1
    const [rolePerms] = await connection.execute(`
      SELECT rp.*, p.code, p.description 
      FROM role_permissions rp 
      JOIN permissions p ON rp.permission_id = p.id 
      WHERE rp.role_id = 1
    `);
    console.log('\nCurrent permissions for role 1:', rolePerms.length);
    rolePerms.forEach(p => console.log(`- ${p.code}: ${p.description}`));

    // Add all missing permissions to role 1
    console.log('\nAdding all permissions to role 1...');
    const existingPermIds = rolePerms.map(p => p.permission_id);
    
    for (const perm of allPerms) {
      if (!existingPermIds.includes(perm.id)) {
        await connection.execute(
          'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
          [1, perm.id]
        );
        console.log(`Added: ${perm.code} - ${perm.description}`);
      }
    }

    // Verify final count
    const [finalCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM role_permissions WHERE role_id = 1'
    );
    console.log(`\nRole 1 now has ${finalCount[0].count} permissions out of ${allPerms.length} total permissions`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

fixPermissions();