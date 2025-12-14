// Script to test login functionality
import axios from 'axios';

const API_BASE = process.env.API_BASE || 'http://localhost:3000/api';

const testUsers = [
  {
    name: 'System Administrator',
    email: 'admin@topdesign.com',
    password: 'Admin123!'
  },
  {
    name: 'Operations Admin',
    email: 'ops.admin@topdesign.com',
    password: 'Admin123!'
  },
  {
    name: 'IT Administrator',
    email: 'it.admin@topdesign.com',
    password: 'Admin123!'
  }
];

async function testLogin(email, password, userName) {
  try {
    console.log(`\n🔐 Testing login for: ${userName} (${email})`);
    
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email,
      password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200 && response.data.token) {
      console.log('  ✅ Login successful!');
      console.log(`  📝 Token: ${response.data.token.substring(0, 50)}...`);
      console.log(`  👤 User ID: ${response.data.user.id}`);
      console.log(`  👤 Name: ${response.data.user.name}`);
      console.log(`  📧 Email: ${response.data.user.email}`);
      console.log(`  🎭 Role ID: ${response.data.user.role_id}`);
      console.log(`  ⭐ Super Admin: ${response.data.user.is_super_admin ? 'YES ✅' : 'NO ❌'}`);
      
      return {
        success: true,
        user: response.data.user,
        token: response.data.token
      };
    } else {
      console.log('  ❌ Login failed: Unexpected response');
      return { success: false };
    }
  } catch (error) {
    if (error.response) {
      console.log(`  ❌ Login failed: ${error.response.status} - ${error.response.data.error || 'Unknown error'}`);
    } else if (error.request) {
      console.log(`  ❌ Login failed: No response from server. Is the backend running?`);
      console.log(`     Make sure the backend is running on ${API_BASE}`);
    } else {
      console.log(`  ❌ Login failed: ${error.message}`);
    }
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 Testing Login Functionality\n');
  console.log(`📍 API Base URL: ${API_BASE}`);
  console.log('═'.repeat(60));

  let successCount = 0;
  let failCount = 0;

  for (const user of testUsers) {
    const result = await testLogin(user.email, user.password, user.name);
    if (result.success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('📊 Test Summary:');
  console.log(`   ✅ Successful logins: ${successCount}`);
  console.log(`   ❌ Failed logins: ${failCount}`);
  console.log(`   📝 Total tested: ${testUsers.length}`);

  if (failCount > 0) {
    console.log('\n⚠️  Some logins failed. Check:');
    console.log('   1. Backend server is running');
    console.log('   2. Database connection is working');
    console.log('   3. Users exist in database');
    console.log('   4. Passwords are correct');
    process.exit(1);
  } else {
    console.log('\n✅ All login tests passed!');
    process.exit(0);
  }
}

main();

