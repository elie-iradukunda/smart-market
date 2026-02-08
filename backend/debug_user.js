import pool from './src/config/database.js';

async function checkUser() {
  try {
    const [rows] = await pool.execute("SELECT id, name, email, role_id FROM users WHERE name LIKE '%kajangwe%' OR email LIKE '%kajang%@gmail.com'");
    console.log('User details:', JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}

checkUser();
