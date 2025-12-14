// Test login via actual API endpoint (simulating frontend request)
import axios from 'axios';

const API_BASE = process.env.API_BASE || 'http://localhost:3000/api';

async function testLoginAPI(email, password) {
  try {
    console.log(`\n🔐 Testing API Login Endpoint`);
    console.log('─'.repeat(60));
    console.log(`Email: "${email}"`);
    console.log(`Password: "${password}"`);
    console.log(`Password length: ${password.length}`);
    console.log(`Password bytes:`, Buffer.from(password).toString('hex'));
    
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: email,
      password: password
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      validateStatus: () => true // Don't throw on error status
    });

    console.log(`\n📡 Response Status: ${response.status}`);
    console.log(`Response Data:`, JSON.stringify(response.data, null, 2));

    if (response.status === 200) {
      console.log('\n✅ LOGIN SUCCESSFUL!');
      console.log(`Token: ${response.data.token.substring(0, 50)}...`);
      console.log(`User:`, response.data.user);
      return true;
    } else {
      console.log('\n❌ LOGIN FAILED');
      console.log(`Error: ${response.data.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    if (error.response) {
      console.log(`\n❌ API Error: ${error.response.status}`);
      console.log(`Error Data:`, error.response.data);
    } else if (error.request) {
      console.log(`\n❌ No response from server`);
      console.log(`Is backend running on ${API_BASE}?`);
    } else {
      console.log(`\n❌ Error:`, error.message);
    }
    return false;
  }
}

async function main() {
  console.log('🚀 Testing Login via API Endpoint\n');
  console.log(`📍 API Base: ${API_BASE}`);
  console.log('═'.repeat(60));

  const testCases = [
    {
      name: 'Correct credentials',
      email: 'admin@topdesign.com',
      password: 'Admin123!'
    },
    {
      name: 'Email with spaces',
      email: ' admin@topdesign.com ',
      password: 'Admin123!'
    },
    {
      name: 'Uppercase email',
      email: 'ADMIN@TOPDESIGN.COM',
      password: 'Admin123!'
    },
    {
      name: 'Wrong password',
      email: 'admin@topdesign.com',
      password: 'wrongpassword'
    },
    {
      name: 'Password with spaces',
      email: 'admin@topdesign.com',
      password: ' Admin123! '
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 Test: ${testCase.name}`);
    await testLoginAPI(testCase.email, testCase.password);
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
  }

  process.exit(0);
}

main();

