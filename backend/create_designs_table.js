import pool from './src/config/database.js';

async function setup() {
  try {
    console.log('Creating designs table...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS designs (
        id int(11) NOT NULL AUTO_INCREMENT,
        title varchar(255) NOT NULL,
        description text DEFAULT NULL,
        category varchar(100) DEFAULT NULL,
        width decimal(10,2) DEFAULT NULL,
        height decimal(10,2) DEFAULT NULL,
        unit varchar(20) DEFAULT 'meters',
        material varchar(255) DEFAULT NULL,
        colors varchar(255) DEFAULT NULL,
        preview_url varchar(500) DEFAULT NULL,
        source_file_url varchar(500) DEFAULT NULL,
        price decimal(12,2) DEFAULT 0.00,
        status ENUM('draft', 'pending_review', 'published', 'rejected') DEFAULT 'draft',
        created_by int(11) DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Table created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating table:', error);
    process.exit(1);
  }
}

setup();
