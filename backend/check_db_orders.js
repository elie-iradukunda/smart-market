import pool from './src/config/database.js';

async function checkOrders() {
    try {
        const [rows] = await pool.execute('SELECT id, customer_email, customer_name, status FROM custom_design_orders');
        console.log('Orders in DB:', JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

checkOrders();
