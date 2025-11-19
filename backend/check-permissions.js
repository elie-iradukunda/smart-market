import mysql from 'mysql2/promise';

async function checkPermissions() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'smart_market'
  });

  try {
    console.log('Checking current permissions for role 1...');
    const [rolePerms] = await connection.execute(`
      SELECT p.name, p.description 
      FROM role_permissions rp 
      JOIN permissions p ON rp.permission_id = p.id 
      WHERE rp.role_id = 1 
      ORDER BY p.name
    `);

    console.log('Current permissions for role 1:', rolePerms.length);
    rolePerms.forEach(p => console.log('- ' + p.name + ': ' + p.description));

    console.log('\nAll available permissions:');
    const [allPerms] = await connection.execute('SELECT id, name, description FROM permissions ORDER BY name');
    console.log('Total permissions:', allPerms.length);

    console.log('\nMissing permissions for role 1:');
    const rolePermNames = rolePerms.map(p => p.name);
    const missing = allPerms.filter(p => !rolePermNames.includes(p.name));
    missing.forEach(p => console.log('- ' + p.name + ': ' + p.description));

    if (missing.length > 0) {
      console.log('\nAdding missing permissions to role 1...');
      for (const perm of missing) {
        await connection.execute(
          'INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
          [1, perm.id]
        );
        console.log('Added:', perm.name);
      }
      console.log('All permissions added to role 1!');
    } else {
      console.log('Role 1 already has all permissions!');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkPermissions();