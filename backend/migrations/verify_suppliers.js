import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'topdesign_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function verifyTable() {
  try {
    const [rows] = await pool.query('DESCRIBE suppliers');
    console.log('Suppliers Table Columns:');
    rows.forEach(row => {
      console.log(`- ${row.Field} (${row.Type})`);
    });
  } catch (error) {
    console.error('Error verifying table:', error);
  } finally {
    await pool.end();
  }
}

verifyTable();
