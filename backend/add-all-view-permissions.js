import mysql from 'mysql2/promise';

async function addAllViewPermissions() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'smart_market'
  });

  try {
    // Add missing view permissions that routes might need
    const missingPermissions = [
      ['order.create', 'Create orders'],
      ['workorder.view', 'View work orders'],
      ['supplier.create', 'Create suppliers'],
      ['supplier.view', 'View suppliers'],
      ['supplier.update', 'Update suppliers'],
      ['supplier.delete', 'Delete suppliers'],
      ['material.update', 'Update materials'],
      ['material.delete', 'Delete materials'],
      ['po.update', 'Update purchase orders'],
      ['po.delete', 'Delete purchase orders']
    ];

    console.log('Adding missing CRUD permissions...');
    for (const [code, description] of missingPermissions) {
      await connection.execute(
        'INSERT IGNORE INTO permissions (code, description) VALUES (?, ?)',
        [code, description]
      );
      console.log(`Added: ${code}`);
    }

    // Assign all new permissions to Admin role (role_id = 1)
    console.log('\nAssigning all permissions to Admin role...');
    await connection.execute(`
      INSERT IGNORE INTO role_permissions (role_id, permission_id)
      SELECT 1, id FROM permissions
    `);

    // Final count
    const [finalCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM role_permissions WHERE role_id = 1'
    );
    const [totalPerms] = await connection.execute(
      'SELECT COUNT(*) as count FROM permissions'
    );
    
    console.log(`\nAdmin role now has ${finalCount[0].count} out of ${totalPerms[0].count} total permissions`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

addAllViewPermissions();