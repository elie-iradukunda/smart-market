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

async function testRBACCheck() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Testing RBAC permission check for Production Manager...\n');

    const roleId = 7; // Production Manager
    const path = '/orders'; // The path from req.path
    const method = 'GET';
    
    // Simulate the RBAC middleware logic
    const parts = path.split('/').filter(Boolean);
    let resource = parts[0] || '';
    
    if (resource.endsWith('s') && resource.length > 1) {
      resource = resource.slice(0, -1);
    }
    
    const methodToAction = {
      GET: 'view',
      POST: 'create',
      PUT: 'update',
      PATCH: 'update',
      DELETE: 'delete',
    };
    
    const action = methodToAction[method] || '';
    const permissionCode = `${resource}.${action}`;

    console.log('RBAC Check Simulation:');
    console.log(`  Path: ${path}`);
    console.log(`  Method: ${method}`);
    console.log(`  Resource: ${resource}`);
    console.log(`  Action: ${action}`);
    console.log(`  Permission Code: ${permissionCode}`);
    console.log(`  Role ID: ${roleId}\n`);

    // Check if the permission exists for this role
    const [rows] = await connection.execute(
      `SELECT rp.role_id, rp.permission_id, p.code, p.description
       FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       WHERE rp.role_id = ? AND p.code = ?`,
      [roleId, permissionCode]
    );

    if (rows.length > 0) {
      console.log('✅ Permission check PASSED');
      console.log(`   Found permission: ${rows[0].code}`);
      console.log(`   Description: ${rows[0].description}`);
    } else {
      console.log('❌ Permission check FAILED');
      console.log(`   Role ${roleId} does NOT have permission: ${permissionCode}`);
      
      // Check what permissions the role actually has
      const [allPerms] = await connection.execute(
        `SELECT p.code, p.description
         FROM role_permissions rp
         JOIN permissions p ON rp.permission_id = p.id
         WHERE rp.role_id = ?
         ORDER BY p.code`,
        [roleId]
      );
      
      console.log(`\n   Role ${roleId} has ${allPerms.length} permissions:`);
      allPerms.forEach(perm => {
        console.log(`     - ${perm.code}: ${perm.description}`);
      });
    }

  } catch (error) {
    console.error('Error testing RBAC:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testRBACCheck();

