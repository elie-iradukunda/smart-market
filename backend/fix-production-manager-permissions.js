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

async function fixProductionManagerPermissions() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database\n');

    // Production Manager should have these permissions according to migrations
    const requiredPermissions = [
      'workorder.create',
      'workorder.update',
      'workorder.view',
      'worklog.create',
      'order.update',
      'order.view',
      'material.view',
      'supplier.view',
      'report.view',
      'file.view'
    ];

    console.log('Granting required permissions to Production Manager (role_id: 7)...\n');

    // Get permission IDs
    const placeholders = requiredPermissions.map(() => '?').join(',');
    const [permissions] = await connection.execute(
      `SELECT id, code FROM permissions WHERE code IN (${placeholders})`,
      requiredPermissions
    );

    console.log(`Found ${permissions.length} permissions to grant\n`);

    let grantedCount = 0;
    let alreadyHadCount = 0;

    for (const perm of permissions) {
      // Check if already granted
      const [existing] = await connection.execute(
        'SELECT role_id FROM role_permissions WHERE role_id = 7 AND permission_id = ?',
        [perm.id]
      );

      if (existing.length > 0) {
        console.log(`  ✓ Already has: ${perm.code}`);
        alreadyHadCount++;
      } else {
        await connection.execute(
          'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
          [7, perm.id]
        );
        console.log(`  ✅ Granted: ${perm.code}`);
        grantedCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   - Granted: ${grantedCount} new permissions`);
    console.log(`   - Already had: ${alreadyHadCount} permissions`);
    console.log(`   - Total: ${permissions.length} permissions\n`);

    // Verify final state
    const [finalPerms] = await connection.execute(
      `SELECT p.code, p.description
       FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       WHERE rp.role_id = 7
       ORDER BY p.code`
    );

    console.log(`Final permissions for Production Manager (${finalPerms.length} total):`);
    finalPerms.forEach((perm, index) => {
      console.log(`  ${index + 1}. ${perm.code} - ${perm.description}`);
    });

    console.log('\n✅ Production Manager permissions fixed!');
    console.log('\n⚠️  IMPORTANT: User must LOG OUT and LOG BACK IN to refresh JWT token!');

  } catch (error) {
    console.error('Error fixing permissions:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

fixProductionManagerPermissions();

