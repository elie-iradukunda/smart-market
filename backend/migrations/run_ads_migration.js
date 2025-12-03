import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../src/config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runAdsMigration() {
  try {
    console.log('Running ads migration...');
    const migrationFile = fs.readFileSync(path.join(__dirname, '030_create_ads_table.sql'), 'utf8');
    const statements = migrationFile.split(';').filter(stmt => stmt.trim().length > 0);

    for (const statement of statements) {
      try {
        await pool.execute(statement);
      } catch (err) {
        // Ignore "Table already exists" or "Duplicate entry" errors if we want to be idempotent
        // But for now, let's log them.
        if (err.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log('Table already exists, skipping creation.');
        } else if (err.code === 'ER_DUP_ENTRY') {
          console.log('Duplicate entry, skipping insert.');
        } else {
          throw err;
        }
      }
    }
    console.log('Ads migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runAdsMigration();
