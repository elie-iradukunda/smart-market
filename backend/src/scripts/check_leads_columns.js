import pool from '../config/database.js';

async function checkColumns() {
  try {
    const [rows] = await pool.execute('DESCRIBE leads');
    console.log('Columns in leads table:', rows.map(r => r.Field));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkColumns();
