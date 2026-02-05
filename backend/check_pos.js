import pool from './src/config/database.js';
try {
  const [tables] = await pool.execute('SHOW TABLES');
  console.log('Tables:', tables.map(t => Object.values(t)[0]));
  
  const [pos_sales] = await pool.execute('DESCRIBE pos_sales');
  console.log('\n--- POS_SALES ---');
  pos_sales.forEach(c => console.log(c.Field, c.Type));

  process.exit(0);
} catch (err) {
  console.error(err);
  process.exit(1);
}
