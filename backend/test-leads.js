import pool from './src/config/database.js';

async function testLeads() {
  let connection;
  try {
    // Test database connection
    connection = await pool.getConnection();
    console.log('✅ Database connection successful');

    // Check if leads table exists
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'leads'"
    );
    
    if (tables.length === 0) {
      console.log('❌ Leads table does not exist');
      return;
    }
    
    console.log('✅ Leads table exists');
    
    // Check table structure
    const [columns] = await connection.query(
      "DESCRIBE leads"
    );
    console.log('\nLeads table structure:');
    console.table(columns);
    
    // Check if there are any leads
    const [leads] = await connection.query(
      "SELECT * FROM leads LIMIT 5"
    );
    
    console.log('\nSample leads:');
    if (leads.length > 0) {
      console.table(leads);
    } else {
      console.log('No leads found in the database');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.release();
      console.log('\n✅ Database connection closed');
    }
    process.exit();
  }
}

testLeads();
