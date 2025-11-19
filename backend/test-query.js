import mysql from 'mysql2/promise';

async function testQuery() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'smart_market'
  });

  try {
    console.log('Testing work_orders query...');
    const [workOrders] = await connection.execute('SELECT * FROM work_orders ORDER BY created_at DESC');
    console.log('Query successful. Found', workOrders.length, 'work orders');
    console.log('Sample data:', workOrders[0] || 'No data');
  } catch (error) {
    console.error('Query failed:', error.message);
  } finally {
    await connection.end();
  }
}

testQuery();