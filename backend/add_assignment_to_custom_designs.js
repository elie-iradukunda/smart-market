import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  console.log('Connecting to database:', process.env.DB_NAME || 'smart_market_new');
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
    console.log('Adding columns to custom_design_orders...');
    
    try {
        await pool.query("ALTER TABLE custom_design_orders ADD COLUMN assigned_to INT NULL AFTER payment_link");
        console.log('✅ Added assigned_to column');
    } catch(e) { console.log('ℹ️ assigned_to might already exist:', e.message); }

    try {
        await pool.query("ALTER TABLE custom_design_orders ADD COLUMN production_stage VARCHAR(50) NULL AFTER assigned_to");
        console.log('✅ Added production_stage column');
    } catch(e) { console.log('ℹ️ production_stage might already exist:', e.message); }

    try {
        await pool.query("ALTER TABLE custom_design_orders ADD CONSTRAINT fk_custom_design_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id)");
        console.log('✅ Added FK constraint');
    } catch(e) { console.log('ℹ️ FK constraint might already exist:', e.message); }

    console.log('🏁 Successfully updated custom_design_orders schema.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
