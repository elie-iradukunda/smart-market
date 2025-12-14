// Script to update existing admin users to have is_super_admin flag
import pool from '../src/config/database.js';

async function updateExistingAdmins() {
  try {
    const connection = await pool.getConnection();
    
    try {
      // Update all users with role_id = 1 (owner) to have is_super_admin = TRUE
      const [result] = await connection.query(`
        UPDATE users 
        SET is_super_admin = TRUE 
        WHERE role_id = 1 OR email LIKE '%admin@topdesign.com'
      `);
      
      console.log(`✅ Updated ${result.affectedRows} admin users with super admin flag`);
      
      // Show updated users
      const [users] = await connection.query(`
        SELECT id, name, email, role_id, is_super_admin 
        FROM users 
        WHERE is_super_admin = TRUE
      `);
      
      console.log('\n📋 Users with super admin flag:');
      users.forEach(user => {
        console.log(`  - ${user.name} (${user.email}) - Role: ${user.role_id}, Super Admin: ${user.is_super_admin}`);
      });
      
    } finally {
      connection.release();
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to update admin users:', error);
    process.exit(1);
  }
}

updateExistingAdmins();

