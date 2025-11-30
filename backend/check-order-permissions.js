import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_market_db',
};

async function checkPermissions() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database.');

    const [permissions] = await connection.execute(
      'SELECT * FROM permissions WHERE code LIKE "order%"'
    );
    console.log('Order permissions:', permissions);

    const [rolePermissions] = await connection.execute(
      `SELECT rp.*, p.code FROM role_permissions rp 
       JOIN permissions p ON rp.permission_id = p.id 
       WHERE rp.role_id = 6 AND p.code LIKE "order%"`
    );
    console.log('Technician order permissions:', rolePermissions);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) await connection.end();
  }
}

checkPermissions();
