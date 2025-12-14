// Quick login test with specific credentials
import axios from 'axios';

const API_BASE = process.env.API_BASE || 'http://localhost:3000/api';
const EMAIL = 'admin@topdesign.com';
const PASSWORD = 'Admin123!';

async function testLogin() {
  try {
    console.log('🔐 Testing Login Endpoint\n');
    console.log('═'.repeat(60));
    console.log(`Email: ${EMAIL}`);
    console.log(`Password: ${PASSWORD}`);
    console.log(`API Base: ${API_BASE}`);
    console.log('═'.repeat(60));
    
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: EMAIL,
      password: PASSWORD
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      validateStatus: () => true // Don't throw on error
    });

    console.log(`\n📡 Response Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('\n✅ LOGIN SUCCESSFUL!\n');
      console.log('Token:', response.data.token);
      console.log('\nUser Data:');
      console.log(JSON.stringify(response.data.user, null, 2));
      console.log('\n✅ All good! You can use these credentials to login.');
    } else {
      console.log('\n❌ LOGIN FAILED\n');
      console.log('Error:', response.data.error || 'Unknown error');
      console.log('\nFull Response:', JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    if (error.response) {
      console.log(`\n❌ API Error: ${error.response.status}`);
      console.log('Error:', error.response.data);
    } else if (error.request) {
      console.log('\n❌ No response from server');
      console.log(`\n⚠️  Backend server is not running on ${API_BASE}`);
      console.log('\nTo start the backend:');
      console.log('  cd backend');
      console.log('  npm start');
    } else {
      console.log('\n❌ Error:', error.message);
    }
  }
}

testLogin();

