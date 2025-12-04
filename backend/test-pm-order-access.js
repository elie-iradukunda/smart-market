/**
 * Test script to verify Production Manager can access orders
 * This simulates what happens when a Production Manager tries to access /api/orders
 */

import pool from './src/config/database.js';

async function testPMAccess() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Simulate the RBAC check for Production Manager accessing /api/orders
    const roleId = 7; // Production Manager
    const path = '/orders'; // The route path (without /api prefix)
    const method = 'GET';
    
    // RBAC middleware logic
    const parts = path.split('/').filter(Boolean);
    let resource = parts[0] || '';
    
    // Convert plural to singular
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
    
    console.log('🔍 Simulating RBAC Check:');
    console.log(`   Path: ${path}`);
    console.log(`   Method: ${method}`);
    console.log(`   Resource: ${resource}`);
    console.log(`   Action: ${action}`);
    console.log(`   Required Permission: ${permissionCode}`);
    console.log(`   Role ID: ${roleId}`);
    console.log('');
    
    // Check if the permission exists for this role
    const [rows] = await connection.execute(
      `SELECT rp.*, p.code, p.description 
       FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       WHERE rp.role_id = ? AND p.code = ?`,
      [roleId, permissionCode]
    );
    
    if (rows.length > 0) {
      console.log('✅ SUCCESS: Production Manager HAS the required permission!');
      console.log(`   Permission: ${rows[0].code} - ${rows[0].description}`);
    } else {
      console.log('❌ FAILED: Production Manager does NOT have the required permission!');
      
      // Show what permissions they do have
      const [userPerms] = await connection.execute(
        `SELECT p.code FROM role_permissions rp
         JOIN permissions p ON rp.permission_id = p.id
         WHERE rp.role_id = ?
         ORDER BY p.code`,
        [roleId]
      );
      
      console.log(`\n   User has these permissions (${userPerms.length} total):`);
      userPerms.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.code}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

testPMAccess();

