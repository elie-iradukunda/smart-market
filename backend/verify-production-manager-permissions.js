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

async function verifyPermissions() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database\n');

    // Check Production Manager role (ID: 7)
    console.log('Checking Production Manager (role_id: 7) permissions...\n');
    
    const [roleCheck] = await connection.execute(
      'SELECT id, name FROM roles WHERE id = 7'
    );

    if (roleCheck.length === 0) {
      console.log('❌ Production Manager role (ID: 7) not found!');
      return;
    }

    console.log(`✓ Role found: ${roleCheck[0].name} (ID: ${roleCheck[0].id})\n`);

    // Check if order.view permission exists
    const [permCheck] = await connection.execute(
      'SELECT id, code, description FROM permissions WHERE code = ?',
      ['order.view']
    );

    if (permCheck.length === 0) {
      console.log('❌ order.view permission not found in database!');
      return;
    }

    console.log(`✓ Permission found: ${permCheck[0].code} (ID: ${permCheck[0].id})`);
    console.log(`  Description: ${permCheck[0].description}\n`);

    // Check if Production Manager has order.view permission
    const [hasPermission] = await connection.execute(
      `SELECT rp.role_id, rp.permission_id, p.code, p.description
       FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       WHERE rp.role_id = 7 AND p.code = 'order.view'`
    );

    if (hasPermission.length > 0) {
      console.log('✅ Production Manager HAS order.view permission');
      console.log(`   Permission ID: ${hasPermission[0].permission_id}`);
      console.log(`   Code: ${hasPermission[0].code}\n`);
    } else {
      console.log('❌ Production Manager DOES NOT have order.view permission');
      console.log('   Granting permission now...\n');
      
      await connection.execute(
        'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
        [7, permCheck[0].id]
      );
      
      console.log('✅ Permission granted!\n');
    }

    // List all permissions for Production Manager
    const [allPerms] = await connection.execute(
      `SELECT p.code, p.description
       FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       WHERE rp.role_id = 7
       ORDER BY p.code`
    );

    console.log(`\nAll permissions for Production Manager (${allPerms.length} total):`);
    allPerms.forEach((perm, index) => {
      const marker = perm.code === 'order.view' ? '✓' : ' ';
      console.log(`  ${marker} ${index + 1}. ${perm.code} - ${perm.description}`);
    });

    console.log('\n✅ Verification complete!');
    console.log('\n⚠️  IMPORTANT: If the user is still seeing "Insufficient permissions":');
    console.log('   1. The user needs to LOG OUT and LOG BACK IN');
    console.log('   2. This refreshes their JWT token with updated permissions');
    console.log('   3. The token contains cached role information');

  } catch (error) {
    console.error('Error verifying permissions:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

verifyPermissions();

