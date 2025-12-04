import pool from './src/config/database.js';

async function checkPMPermission() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Check if Production Manager (role_id: 7) has order.view permission
    const [rows] = await connection.execute(
      `SELECT p.code, p.description 
       FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       WHERE rp.role_id = 7 AND p.code = 'order.view'`
    );
    
    if (rows.length > 0) {
      console.log('✅ YES - Production Manager (Role 7) HAS order.view permission');
      console.log(`   Permission: ${rows[0].code} - ${rows[0].description}`);
    } else {
      console.log('❌ NO - Production Manager (Role 7) does NOT have order.view permission');
    }
    
    // Also show all permissions for Production Manager
    const [allPerms] = await connection.execute(
      `SELECT p.code 
       FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       WHERE rp.role_id = 7
       ORDER BY p.code`
    );
    
    console.log(`\n📋 All permissions for Production Manager (${allPerms.length} total):`);
    allPerms.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.code}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

checkPMPermission();

