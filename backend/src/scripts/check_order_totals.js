import pool from '../config/database.js';

async function checkOrderTotals() {
  try {
    const [orders] = await pool.execute(`
      SELECT o.id, o.quote_id, o.total_amount as order_total, o.balance, 
             q.total_amount as quote_total,
             COALESCE(NULLIF(q.total_amount, 0), NULLIF(o.total_amount, 0), o.balance) as calculated_total
      FROM orders o 
      LEFT JOIN quotes q ON o.quote_id = q.id
      ORDER BY o.id DESC
      LIMIT 10
    `);
    
    console.log('Order totals check:');
    console.table(orders);
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkOrderTotals();
