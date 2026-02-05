import pool from './src/config/database.js';

async function listInfo() {
  try {
    console.log('--- ROLES ---');
    const [roles] = await pool.query('SELECT * FROM roles');
    console.log(JSON.stringify(roles, null, 2));

    console.log('\n--- USERS ---');
    const [users] = await pool.query('SELECT id, name, email, role_id, status FROM users');
    console.log(JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

listInfo();
