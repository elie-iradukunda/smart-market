import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './src/config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    const migrationFile = path.join(__dirname, 'migrations', '021_create_lead_items.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');
    
    console.log('Running migration: 021_create_lead_items.sql');
    
    // Split by semicolon to handle multiple statements if any, though here it's just one
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);

    for (const statement of statements) {
      await pool.execute(statement);
    }
    
    console.log('✅ Lead items table created successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
