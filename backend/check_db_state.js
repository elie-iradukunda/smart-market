
import pool from './src/config/database.js';

async function run() {
  try {
    const [users] = await pool.execute('SELECT id, name, role_id FROM users');
    console.table(users);
  } catch (err) { console.error(err); } 
  finally { process.exit(); }
}
run();
