// Direct login test with detailed output
import pool from '../src/config/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

async function testLoginDirect(email, password) {
  try {
    console.log(`\n🔐 Testing login for: ${email}`);
    console.log('─'.repeat(60));
    
    const connection = await pool.getConnection();
    
    try {
      // Step 1: Normalize email
      const normalizedEmail = email.trim().toLowerCase();
      console.log(`1️⃣  Normalized email: "${normalizedEmail}"`);
      
      // Step 2: Query user
      const [users] = await connection.query(
        'SELECT * FROM users WHERE LOWER(TRIM(email)) = ? AND status = "active"',
        [normalizedEmail]
      );
      
      console.log(`2️⃣  Database query result: ${users.length} user(s) found`);
      
      if (users.length === 0) {
        console.log('❌ ERROR: User not found or inactive');
        
        // Check if user exists but inactive
        const [allUsers] = await connection.query(
          'SELECT id, email, status FROM users WHERE LOWER(TRIM(email)) = ?',
          [normalizedEmail]
        );
        
        if (allUsers.length > 0) {
          console.log(`   Found user but status is: "${allUsers[0].status}"`);
          console.log('   💡 Fix: Update user status to "active"');
        } else {
          console.log('   User does not exist in database');
        }
        
        return false;
      }
      
      const user = users[0];
      console.log(`3️⃣  User found: ${user.name} (ID: ${user.id})`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Status: ${user.status}`);
      console.log(`   Role ID: ${user.role_id}`);
      console.log(`   Super Admin: ${user.is_super_admin ? 'YES' : 'NO'}`);
      
      // Step 3: Check password hash
      if (!user.password_hash) {
        console.log('❌ ERROR: No password hash found');
        return false;
      }
      
      console.log(`4️⃣  Password hash exists: YES`);
      console.log(`   Hash: ${user.password_hash.substring(0, 30)}...`);
      
      // Step 4: Compare password
      console.log(`5️⃣  Comparing password...`);
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      
      if (!isValidPassword) {
        console.log('❌ ERROR: Password mismatch');
        console.log(`   Provided password: "${password}"`);
        console.log('   💡 Fix: Password does not match stored hash');
        
        // Test with Admin123!
        const testPassword = 'Admin123!';
        const testMatch = await bcrypt.compare(testPassword, user.password_hash);
        console.log(`   Test with 'Admin123!': ${testMatch ? '✅ MATCHES' : '❌ NO MATCH'}`);
        
        return false;
      }
      
      console.log('✅ Password matches!');
      
      // Step 5: Generate token
      console.log(`6️⃣  Generating JWT token...`);
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );
      
      console.log('✅ Token generated successfully!');
      console.log(`   Token: ${token.substring(0, 50)}...`);
      
      // Step 6: Return user data
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        is_super_admin: user.is_super_admin || false
      };
      
      console.log('\n✅ LOGIN SUCCESSFUL!');
      console.log('User data:', JSON.stringify(userData, null, 2));
      
      return { success: true, token, user: userData };
      
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Direct Login Test\n');
  
  const testCases = [
    { email: 'admin@topdesign.com', password: 'Admin123!' },
    { email: 'ADMIN@TOPDESIGN.COM', password: 'Admin123!' }, // Test case sensitivity
    { email: ' admin@topdesign.com ', password: 'Admin123!' }, // Test whitespace
    { email: 'admin@topdesign.com', password: 'wrongpassword' }, // Test wrong password
  ];
  
  for (const testCase of testCases) {
    await testLoginDirect(testCase.email, testCase.password);
  }
  
  process.exit(0);
}

main();

