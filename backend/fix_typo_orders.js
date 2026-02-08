import pool from './src/config/database.js';

async function fix() {
  try {
    const [result] = await pool.execute(
      "UPDATE custom_design_orders SET customer_email = 'kajangwe@gmail.com' WHERE customer_email = 'kajanga@gmail.com'"
    );
    console.log('Fixed orders:', result.affectedRows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}

fix();
