import pool from './src/config/database.js';

async function migrate() {
  try {
    // Add status column to Products if it doesn't exist
    const [columns] = await pool.execute('DESCRIBE products');
    const hasStatus = columns.some(c => c.Field === 'status');
    
    if (!hasStatus) {
      console.log('Adding status column to products table...');
      await pool.execute("ALTER TABLE products ADD COLUMN status VARCHAR(20) DEFAULT 'active' AFTER stock_quantity");
      console.log('Status column added.');
    } else {
      console.log('Status column already exists.');
    }
    
    // Also, let's make sure we have some products with 'pending' to test
    // Actually, let's just update all existing to 'active'
    await pool.execute("UPDATE products SET status = 'active' WHERE status IS NULL");
    
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
