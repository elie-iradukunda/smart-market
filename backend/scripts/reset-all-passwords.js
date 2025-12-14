// Script to reset all user passwords to the same value
import pool from '../src/config/database.js';
import bcrypt from 'bcryptjs';

const DEFAULT_PASSWORD = 'Admin123!';

async function resetAllPasswords() {
  try {
    const connection = await pool.getConnection();
    
    try {
      console.log('🔐 Resetting All User Passwords\n');
      console.log('═'.repeat(60));
      console.log(`New password for all users: "${DEFAULT_PASSWORD}"\n`);
      
      // Get all users
      const [users] = await connection.query(`
        SELECT id, name, email, role_id, status
        FROM users
        ORDER BY id
      `);
      
      console.log(`Found ${users.length} users to update\n`);
      
      // Hash the password once
      const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
      console.log(`Generated password hash: ${hashedPassword.substring(0, 30)}...\n`);
      
      // Update all users
      let updatedCount = 0;
      for (const user of users) {
        await connection.query(
          'UPDATE users SET password_hash = ? WHERE id = ?',
          [hashedPassword, user.id]
        );
        
        console.log(`✅ Updated: ${user.name} (${user.email})`);
        updatedCount++;
      }
      
      console.log(`\n✅ Successfully updated ${updatedCount} user passwords`);
      console.log(`\n📝 All users now have password: "${DEFAULT_PASSWORD}"`);
      console.log('\n🧪 Testing passwords...\n');
      
      // Test all passwords
      for (const user of users) {
        const [updatedUser] = await connection.query(
          'SELECT password_hash FROM users WHERE id = ?',
          [user.id]
        );
        
        const isValid = await bcrypt.compare(DEFAULT_PASSWORD, updatedUser[0].password_hash);
        const status = isValid ? '✅ MATCHES' : '❌ NO MATCH';
        console.log(`  ${user.email}: ${status}`);
      }
      
      console.log('\n✅ Password reset complete!\n');
      
    } finally {
      connection.release();
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetAllPasswords();

