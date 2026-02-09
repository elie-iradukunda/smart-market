
import pool from './src/config/database.js';

async function run() {
  try {
    console.log('Altering work_orders.stage...');
    await pool.execute("ALTER TABLE work_orders MODIFY COLUMN stage VARCHAR(50)");
    
    console.log('Altering custom_design_orders.status...');
    await pool.execute("ALTER TABLE custom_design_orders MODIFY COLUMN status VARCHAR(50)");
    
    // Also might need to update orders.status if it's too restrictive
    console.log('Altering orders.status...');
    await pool.execute("ALTER TABLE orders MODIFY COLUMN status VARCHAR(50)");

    console.log('Schema update complete.');
  } catch (err) { console.error('Schema update failed:', err); } 
  finally { process.exit(); }
}
run();
