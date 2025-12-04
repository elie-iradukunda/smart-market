import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_market',
};

async function fixOrderPermissions() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database\n');

    // Ensure order.view permission exists
    console.log('Checking order.view permission...');
    const [permissions] = await connection.execute(
      'SELECT id FROM permissions WHERE code = ?',
      ['order.view']
    );

    let permissionId;
    if (permissions.length === 0) {
      console.log('Creating order.view permission...');
      const [result] = await connection.execute(
        'INSERT INTO permissions (code, description) VALUES (?, ?)',
        ['order.view', 'View orders']
      );
      permissionId = result.insertId;
      console.log(`✓ Created permission with ID: ${permissionId}`);
    } else {
      permissionId = permissions[0].id;
      console.log(`✓ Permission exists with ID: ${permissionId}\n`);
    }

    // Roles that should have order.view permission
    const rolesNeedingOrderView = [
      { id: 1, name: 'Owner' }, // Owner has all permissions, but let's ensure it
      { id: 4, name: 'Controller' },
      { id: 5, name: 'Reception' },
      { id: 6, name: 'Technician' },
      { id: 7, name: 'Production Manager' },
      { id: 8, name: 'Inventory Manager' },
      { id: 9, name: 'Sales Rep' },
    ];

    console.log('Granting order.view permission to roles...\n');

    for (const role of rolesNeedingOrderView) {
      // Check if role exists
      const [roleCheck] = await connection.execute(
        'SELECT id, name FROM roles WHERE id = ?',
        [role.id]
      );

      if (roleCheck.length === 0) {
        console.log(`⚠ Role ID ${role.id} (${role.name}) not found, skipping...`);
        continue;
      }

      // Check if permission already granted
      const [existing] = await connection.execute(
        'SELECT role_id FROM role_permissions WHERE role_id = ? AND permission_id = ?',
        [role.id, permissionId]
      );

      if (existing.length > 0) {
        console.log(`✓ ${role.name} (ID: ${role.id}) already has order.view permission`);
      } else {
        await connection.execute(
          'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
          [role.id, permissionId]
        );
        console.log(`✓ Granted order.view permission to ${role.name} (ID: ${role.id})`);
      }
    }

    // Also grant to Owner (role 1) - ensure all permissions
    console.log('\nEnsuring Owner has all permissions...');
    const [allPermissions] = await connection.execute('SELECT id FROM permissions');
    const [ownerPermissions] = await connection.execute(
      'SELECT permission_id FROM role_permissions WHERE role_id = 1'
    );
    const ownerPermissionIds = ownerPermissions.map(p => p.permission_id);
    
    let addedCount = 0;
    for (const perm of allPermissions) {
      if (!ownerPermissionIds.includes(perm.id)) {
        await connection.execute(
          'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
          [1, perm.id]
        );
        addedCount++;
      }
    }
    if (addedCount > 0) {
      console.log(`✓ Added ${addedCount} missing permissions to Owner role`);
    } else {
      console.log(`✓ Owner already has all permissions`);
    }

    // Verify final state
    console.log('\n' + '='.repeat(80));
    console.log('\nVerifying permissions...\n');
    
    const [verification] = await connection.execute(
      `SELECT r.id, r.name, COUNT(rp.permission_id) as permission_count
       FROM roles r
       LEFT JOIN role_permissions rp ON r.id = rp.role_id
       WHERE r.id IN (1, 4, 5, 6, 7, 8, 9)
       GROUP BY r.id, r.name
       ORDER BY r.id`
    );

    console.log('Roles with order.view permission:');
    for (const role of verification) {
      const [hasOrderView] = await connection.execute(
        `SELECT COUNT(*) as count FROM role_permissions rp
         JOIN permissions p ON rp.permission_id = p.id
         WHERE rp.role_id = ? AND p.code = 'order.view'`,
        [role.id]
      );
      const status = hasOrderView[0].count > 0 ? '✓ YES' : '✗ NO';
      console.log(`  ${role.id}. ${role.name}: ${status} (${role.permission_count} total permissions)`);
    }

    console.log('\n✅ Order permissions fixed!');
    console.log('\nUsers with these roles can now access /api/orders');

  } catch (error) {
    console.error('Error fixing order permissions:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

fixOrderPermissions();

