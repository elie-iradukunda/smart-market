// Script to debug login issues
import pool from '../src/config/database.js';
import bcrypt from 'bcryptjs';

async function debugLogin() {
  try {
    const connection = await pool.getConnection();
    
    try {
      console.log('🔍 Debugging Login Issues\n');
      console.log('═'.repeat(60));
      
      // Get all users
      const [users] = await connection.query(`
        SELECT id, name, email, phone, password_hash, role_id, status, is_super_admin
        FROM users
        ORDER BY id
      `);
      
      console.log(`\n📋 Found ${users.length} users in database:\n`);
      
      for (const user of users) {
        console.log(`User ID: ${user.id}`);
        console.log(`  Name: ${user.name}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Status: ${user.status}`);
        console.log(`  Role ID: ${user.role_id}`);
        console.log(`  Super Admin: ${user.is_super_admin ? 'YES' : 'NO'}`);
        
        // Test password
        const testPassword = 'Admin123!';
        let passwordMatch = false;
        
        if (user.password_hash) {
          try {
            passwordMatch = await bcrypt.compare(testPassword, user.password_hash);
            console.log(`  Password 'Admin123!' matches: ${passwordMatch ? '✅ YES' : '❌ NO'}`);
            
            // If password doesn't match, fix it
            if (!passwordMatch) {
              console.log('  ⚠️  Fixing password...');
              const newHash = await bcrypt.hash(testPassword, 10);
              await connection.query(
                'UPDATE users SET password_hash = ? WHERE id = ?',
                [newHash, user.id]
              );
              console.log('  ✅ Password updated!');
            }
          } catch (error) {
            console.log(`  ❌ Error checking password: ${error.message}`);
          }
        } else {
          console.log('  ⚠️  No password hash found!');
        }
        
        // Check if user is active
        if (user.status !== 'active') {
          console.log(`  ⚠️  User status is '${user.status}' - should be 'active'`);
          await connection.query(
            'UPDATE users SET status = ? WHERE id = ?',
            ['active', user.id]
          );
          console.log('  ✅ Status updated to active!');
        }
        
        console.log('');
      }
      
      // Test login query exactly as the controller does
      console.log('═'.repeat(60));
      console.log('\n🧪 Testing Login Query Logic:\n');
      
      const testEmail = 'admin@topdesign.com';
      const [testUsers] = await connection.query(
        'SELECT * FROM users WHERE email = ? AND status = "active"',
        [testEmail]
      );
      
      console.log(`Query: SELECT * FROM users WHERE email = '${testEmail}' AND status = 'active'`);
      console.log(`Results: ${testUsers.length} user(s) found`);
      
      if (testUsers.length > 0) {
        const testUser = testUsers[0];
        console.log(`  ✅ User found: ${testUser.name}`);
        console.log(`  Email: ${testUser.email}`);
        console.log(`  Status: ${testUser.status}`);
        console.log(`  Password hash exists: ${testUser.password_hash ? 'YES' : 'NO'}`);
        
        // Test password
        const testPassword = 'Admin123!';
        if (testUser.password_hash) {
          const isValid = await bcrypt.compare(testPassword, testUser.password_hash);
          console.log(`  Password '${testPassword}' matches: ${isValid ? '✅ YES' : '❌ NO'}`);
          
          if (!isValid) {
            console.log('  ⚠️  Password mismatch! Updating...');
            const newHash = await bcrypt.hash(testPassword, 10);
            await connection.query(
              'UPDATE users SET password_hash = ? WHERE id = ?',
              [newHash, testUser.id]
            );
            console.log('  ✅ Password updated!');
          }
        }
      } else {
        console.log(`  ❌ No user found with email '${testEmail}' and status 'active'`);
      }
      
      console.log('\n✅ Debug complete!\n');
      
    } finally {
      connection.release();
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugLogin();

