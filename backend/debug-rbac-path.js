/**
 * Debug script to understand how Express handles route paths
 * This will help us understand what req.path the RBAC middleware receives
 */

console.log('Route mounting analysis:');
console.log('');
console.log('1. Route definition: router.get("/orders", ...)');
console.log('2. Router mounted at: app.use("/api", orderRoutes)');
console.log('3. Full URL path: /api/orders');
console.log('');
console.log('In Express:');
console.log('  - req.originalUrl = "/api/orders" (full path from request)');
console.log('  - req.baseUrl = "/api" (mount point)');
console.log('  - req.path = "/orders" (path relative to mount point)');
console.log('');
console.log('So RBAC middleware should see:');
console.log('  req.path = "/orders"');
console.log('  Which should derive: "order.view"');
console.log('');
console.log('Let\'s verify the permission exists in the database...');

import pool from './src/config/database.js';

async function verify() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Check if order.view permission exists
    const [permRows] = await connection.execute(
      'SELECT id, code, description FROM permissions WHERE code = ?',
      ['order.view']
    );
    
    if (permRows.length === 0) {
      console.log('❌ ERROR: order.view permission does NOT exist in database!');
      return;
    }
    
    console.log('✅ order.view permission exists:');
    console.log(`   ID: ${permRows[0].id}, Code: ${permRows[0].code}`);
    console.log(`   Description: ${permRows[0].description}`);
    console.log('');
    
    // Check if Production Manager has this permission
    const [rolePermRows] = await connection.execute(
      `SELECT rp.role_id, r.name as role_name, p.code 
       FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       JOIN roles r ON rp.role_id = r.id
       WHERE rp.role_id = 7 AND p.code = 'order.view'`
    );
    
    if (rolePermRows.length === 0) {
      console.log('❌ ERROR: Production Manager (role_id=7) does NOT have order.view permission!');
      console.log('');
      console.log('Let\'s check what permissions they DO have:');
      const [allPerms] = await connection.execute(
        `SELECT p.code FROM role_permissions rp
         JOIN permissions p ON rp.permission_id = p.id
         WHERE rp.role_id = 7
         ORDER BY p.code`
      );
      console.log(`   Total permissions: ${allPerms.length}`);
      allPerms.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.code}`);
      });
    } else {
      console.log('✅ Production Manager (role_id=7) HAS order.view permission!');
      console.log(`   Role: ${rolePermRows[0].role_name}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

verify();

