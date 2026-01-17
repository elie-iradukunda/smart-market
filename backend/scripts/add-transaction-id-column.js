/**
 * Script to add transaction_id column to ecommerce_orders table
 * Run this with: node scripts/add-transaction-id-column.js
 */

import pool from '../src/config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function addTransactionIdColumn() {
  const connection = await pool.getConnection();
  try {
    console.log('Checking if transaction_id column exists...');
    
    // Check if column exists
    const [columns] = await connection.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ecommerce_orders' AND COLUMN_NAME = 'transaction_id'"
    );

    if (columns.length > 0) {
      console.log('✓ transaction_id column already exists in ecommerce_orders table');
      return;
    }

    console.log('Adding transaction_id column to ecommerce_orders table...');
    
    // Add the column
    await connection.execute(
      'ALTER TABLE ecommerce_orders ADD COLUMN transaction_id VARCHAR(100) AFTER payment_status'
    );

    console.log('✓ Successfully added transaction_id column to ecommerce_orders table');
  } catch (error) {
    console.error('✗ Error adding transaction_id column:', error.message);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

addTransactionIdColumn()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
