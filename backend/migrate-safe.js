import fs from 'fs';
import pool from './src/config/database.js';

async function migrate() {
  try {
    const sql = fs.readFileSync('./migrations/001_create_tables.sql', 'utf8');
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await pool.execute(statement);
          console.log('✓ Executed statement');
        } catch (error) {
          if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.code === 'ER_DUP_ENTRY') {
            console.log('⚠ Skipped (already exists)');
          } else {
            throw error;
          }
        }
      }
    }
    
    console.log('Migration completed');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();