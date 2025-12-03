import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
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
  queueLimit: 0,
  multipleStatements: true
});

async function runMigration() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔄 Running migration: 003_enhance_suppliers.sql');
    console.log('━'.repeat(50));
    
    const migrationPath = join(__dirname, '003_enhance_suppliers.sql');
    const sql = readFileSync(migrationPath, 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    let successCount = 0;
    let skipCount = 0;
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.query(statement);
          successCount++;
          console.log('✓ Statement executed successfully');
        } catch (error) {
          // Ignore errors for columns/indexes that already exist
          if (
            error.code === 'ER_DUP_FIELDNAME' || 
            error.code === 'ER_DUP_KEYNAME' ||
            error.code === 'ER_KEY_COLUMN_DOES_NOT_EXITS' ||
            error.message.includes('Duplicate column') ||
            error.message.includes('Duplicate key') ||
            error.message.includes('already exists')
          ) {
            skipCount++;
            console.log('⚠ Already exists, skipping...');
          } else {
            console.error('❌ Error:', error.message);
            throw error;
          }
        }
      }
    }
    
    console.log('━'.repeat(50));
    console.log(`✅ Migration completed!`);
    console.log(`   - ${successCount} statements executed`);
    console.log(`   - ${skipCount} statements skipped (already exists)`);
    console.log('━'.repeat(50));
    
  } catch (error) {
    console.log('━'.repeat(50));
    console.error('❌ Migration failed:', error.message);
    console.log('━'.repeat(50));
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

runMigration()
  .then(() => {
    console.log('✨ Migration script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration script failed:', error);
    process.exit(1);
  });
