import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'smart_market_new',
    waitForConnections: true,
    connectionLimit: 1,
    queueLimit: 0
  });

  try {
    console.log('Adding custom_design_order_id to work_orders...');
    
    try {
        await pool.query("ALTER TABLE work_orders ADD COLUMN custom_design_order_id INT NULL AFTER order_id");
        console.log('✅ Added custom_design_order_id column');
    } catch(e) { console.log('ℹ️ custom_design_order_id might already exist:', e.message); }

    try {
        await pool.query("ALTER TABLE work_orders ADD CONSTRAINT fk_work_orders_custom_design_order FOREIGN KEY (custom_design_order_id) REFERENCES custom_design_orders(id)");
        console.log('✅ Added FK constraint');
    } catch(e) { console.log('ℹ️ FK constraint might already exist:', e.message); }

    console.log('🏁 Successfully updated work_orders schema.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
