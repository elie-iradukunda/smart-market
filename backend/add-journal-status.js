import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'smart_market',
    multipleStatements: true
  });

  try {
    console.log('Connected to database...');
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'migrations', '041_add_journal_status.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('Running migration: 041_add_journal_status.sql');
    
    // Execute the SQL
    await connection.query(sql);
    
    console.log('✅ Migration completed successfully!');
    console.log('✅ Status column added to journal_entries table.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigration();
