
import pool from './src/config/database.js';

async function check() {
  try {
    const [rows] = await pool.execute('DESCRIBE custom_design_orders');
    console.log(rows.map(r => r.Field));
  } catch (error) {
    console.error(error);
  } finally {
    process.exit();
  }
}

check();
