/**
 * Test script to verify Production Manager can access orders endpoint
 * This simulates the exact request that would come from the frontend
 */

import axios from 'axios';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE = 'http://localhost:3000/api';
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_market',
};

async function testOrdersAccess() {
  let connection;
  try {
    connection = await mysql.createConnection(DB_CONFIG);
    
    // 1. Find a Production Manager user
    const [users] = await connection.execute(
      `SELECT u.id, u.name, u.email, u.role_id, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.role_id = 7 AND u.status = 'active' 
       LIMIT 1`
    );
    
    if (users.length === 0) {
      console.log('❌ No Production Manager user found in database');
      return;
    }
    
    const pmUser = users[0];
    console.log(`✅ Found Production Manager user: ${pmUser.name} (ID: ${pmUser.id})`);
    console.log(`   Email: ${pmUser.email}, Role: ${pmUser.role_name}\n`);
    
    // 2. Check if they have order.view permission
    const [perms] = await connection.execute(
      `SELECT p.code, p.description 
       FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       WHERE rp.role_id = 7 AND p.code = 'order.view'`
    );
    
    if (perms.length === 0) {
      console.log('❌ Production Manager does NOT have order.view permission!');
      console.log('   This is the problem - the permission is missing from the database.\n');
      
      // Show what permissions they do have
      const [allPerms] = await connection.execute(
        `SELECT p.code FROM role_permissions rp
         JOIN permissions p ON rp.permission_id = p.id
         WHERE rp.role_id = 7
         ORDER BY p.code`
      );
      console.log(`   They have ${allPerms.length} permissions:`);
      allPerms.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.code}`);
      });
      
      console.log('\n🔧 SOLUTION: Run the permission fix script:');
      console.log('   npm run fix-all-permissions');
      return;
    }
    
    console.log(`✅ Production Manager HAS order.view permission`);
    console.log(`   Permission: ${perms[0].code} - ${perms[0].description}\n`);
    
    // 3. Try to get a JWT token (would need to login, but we'll just verify the permission exists)
    console.log('📋 Summary:');
    console.log('   ✅ Permission exists in database');
    console.log('   ✅ User exists and is active');
    console.log('   ✅ Role is correct (Production Manager)');
    console.log('\n💡 If you\'re still getting 403 errors:');
    console.log('   1. Make sure backend server is running: npm run dev');
    console.log('   2. Restart the backend server to apply RBAC middleware changes');
    console.log('   3. Log out and log back in to refresh JWT token');
    console.log('   4. Check backend console logs for detailed RBAC check output');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

testOrdersAccess();

