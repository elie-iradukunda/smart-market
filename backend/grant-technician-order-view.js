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

async function grantPermission() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database.');

    // Get permission ID for 'order.view'
    const [permissions] = await connection.execute(
      'SELECT id FROM permissions WHERE code = ?',
      ['order.view']
    );

    if (permissions.length === 0) {
      console.error('Permission order.view not found.');
      return;
    }

    const permissionId = permissions[0].id;
    const roleId = 6; // Technician

    // Check if already assigned
    const [existing] = await connection.execute(
      'SELECT * FROM role_permissions WHERE role_id = ? AND permission_id = ?',
      [roleId, permissionId]
    );

    if (existing.length > 0) {
      console.log('Technician already has order.view permission.');
    } else {
      await connection.execute(
        'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
        [roleId, permissionId]
      );
      console.log('Granted order.view permission to Technician.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) await connection.end();
  }
}

grantPermission();
