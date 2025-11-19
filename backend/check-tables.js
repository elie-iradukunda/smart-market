import mysql from 'mysql2/promise';

async function checkTables() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'smart_market'
  });

  try {
    // Check if work_orders table exists
    const [tables] = await connection.execute("SHOW TABLES LIKE 'work_orders'");
    
    if (tables.length === 0) {
      console.log('work_orders table does not exist. Creating it...');
      
      await connection.execute(`
        CREATE TABLE work_orders (
          id INT PRIMARY KEY AUTO_INCREMENT,
          order_id INT NOT NULL,
          stage VARCHAR(100) NOT NULL,
          assigned_to INT NOT NULL,
          started_at DATETIME NULL,
          ended_at DATETIME NULL,
          notes TEXT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders(id),
          FOREIGN KEY (assigned_to) REFERENCES users(id)
        )
      `);
      console.log('work_orders table created');
    } else {
      console.log('work_orders table exists');
    }

    // Check if work_logs table exists
    const [logTables] = await connection.execute("SHOW TABLES LIKE 'work_logs'");
    
    if (logTables.length === 0) {
      console.log('work_logs table does not exist. Creating it...');
      
      await connection.execute(`
        CREATE TABLE work_logs (
          id INT PRIMARY KEY AUTO_INCREMENT,
          work_order_id INT NOT NULL,
          technician_id INT NOT NULL,
          time_spent_minutes INT NOT NULL,
          material_used TEXT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (work_order_id) REFERENCES work_orders(id),
          FOREIGN KEY (technician_id) REFERENCES users(id)
        )
      `);
      console.log('work_logs table created');
    } else {
      console.log('work_logs table exists');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkTables();