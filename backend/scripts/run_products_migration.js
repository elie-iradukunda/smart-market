import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'smart_market',
    multipleStatements: true
  });

  try {
    console.log('📦 Running products table migration...');
    
    const migrationPath = join(__dirname, '..', 'migrations', '032_create_products_table.sql');
    const sql = await fs.readFile(migrationPath, 'utf8');
    
    await connection.query(sql);
    
    console.log('✅ Products table created successfully!');
    console.log('📊 Table structure:');
    console.log('   - id (INT, PRIMARY KEY, AUTO_INCREMENT)');
    console.log('   - name (VARCHAR(255), NOT NULL)');
    console.log('   - description (TEXT)');
    console.log('   - price (DECIMAL(10,2), NOT NULL)');
    console.log('   - image (VARCHAR(500))');
    console.log('   - category (VARCHAR(100))');
    console.log('   - stock_quantity (INT, DEFAULT 0)');
    console.log('   - created_at (TIMESTAMP)');
    console.log('   - updated_at (TIMESTAMP)');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

runMigration()
  .then(() => {
    console.log('\n🎉 Migration completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration error:', error);
    process.exit(1);
  });
