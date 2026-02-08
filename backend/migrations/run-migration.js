import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from the backend root
const backendRoot = join(__dirname, '..');
dotenv.config({ path: join(backendRoot, '.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
});

async function runMigration() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
      console.error('Usage: node run-migration.js <migration_file.sql>');
      process.exit(1);
  }

  const migrationFile = args[0];
  const migrationPath = migrationFile.includes('/') || migrationFile.includes('\\') 
    ? migrationFile 
    : join(__dirname, migrationFile);

  if (!existsSync(migrationPath)) {
    console.error(`❌ Migration file not found: ${migrationPath}`);
    process.exit(1);
  }

  const connection = await pool.getConnection();
  
  try {
    console.log(`🚀 Running migration: ${migrationFile}`);
    
    const sql = readFileSync(migrationPath, 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          // Strip comments from within statements
          const cleanStatement = statement.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '$1').trim();
          if (cleanStatement) {
            await connection.query(cleanStatement);
            console.log('  ✓ Executed statement');
          }
        } catch (error) {
          // Ignore errors for columns/indexes that already exist
          if (
            error.code === 'ER_DUP_FIELDNAME' || 
            error.code === 'ER_DUP_KEYNAME' ||
            error.code === 'ER_KEY_COLUMN_DOES_NOT_EXITS' ||
            error.code === 'ER_DUP_ENTRY' ||
            error.message.includes('Duplicate column') ||
            error.message.includes('Duplicate key') ||
            error.message.includes('already exists')
          ) {
            console.log('  ⚠ Warning:', error.message.split('\n')[0], '- skipping...');
          } else {
            throw error;
          }
        }
      }
    }
    
    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

runMigration()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    process.exit(1);
  });
