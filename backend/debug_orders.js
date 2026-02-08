import pool from './src/config/database.js';

async function check() {
  try {
    const [tables] = await pool.execute("SHOW TABLES LIKE 'custom_design_orders'");
    console.log('Table exists:', tables.length > 0);
    
    if (tables.length > 0) {
      const [rows] = await pool.execute("SELECT COUNT(*) as count FROM custom_design_orders");
      console.log('Total orders:', rows[0].count);
      
      const [data] = await pool.execute("SELECT id, customer_email, customer_name FROM custom_design_orders LIMIT 5");
      console.log('Last 5 orders:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}

check();
