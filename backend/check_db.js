import pool from './src/config/database.js';
try {
  const [invoices] = await pool.execute('DESCRIBE invoices');
  console.log('--- INVOICES ---');
  invoices.forEach(c => console.log(c.Field, c.Type));
  
  const [orders] = await pool.execute('DESCRIBE orders');
  console.log('\n--- ORDERS ---');
  orders.forEach(c => console.log(c.Field, c.Type));
  
  const [customers] = await pool.execute('DESCRIBE customers');
  console.log('\n--- CUSTOMERS ---');
  customers.forEach(c => console.log(c.Field, c.Type));

  process.exit(0);
} catch (err) {
  console.error(err);
  process.exit(1);
}
