// Script to delete all data from all tables
// WARNING: This will delete ALL data from the database!
// Table structures will be preserved, but all records will be deleted.

import pool from '../src/config/database.js';

async function clearAllData() {
  try {
    const connection = await pool.getConnection();
    
    try {
      console.log('⚠️  WARNING: This will delete ALL data from the database!');
      console.log('Starting data deletion...\n');
      
      // Disable foreign key checks
      await connection.query('SET FOREIGN_KEY_CHECKS = 0');
      
      // Get all table names
      const [tables] = await connection.query(`
        SELECT TABLE_NAME 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_TYPE = 'BASE TABLE'
      `);
      
      console.log(`Found ${tables.length} tables to clear\n`);
      
      // Delete all data from each table
      let totalDeleted = 0;
      for (const table of tables) {
        const tableName = table.TABLE_NAME;
        try {
          const [result] = await connection.query(`DELETE FROM ??`, [tableName]);
          const deleted = result.affectedRows || 0;
          totalDeleted += deleted;
          if (deleted > 0) {
            console.log(`  ✓ Cleared ${tableName}: ${deleted} rows deleted`);
          }
        } catch (error) {
          console.error(`  ✗ Error clearing ${tableName}:`, error.message);
        }
      }
      
      // Reset AUTO_INCREMENT counters
      console.log('\nResetting AUTO_INCREMENT counters...');
      for (const table of tables) {
        const tableName = table.TABLE_NAME;
        try {
          await connection.query(`ALTER TABLE ?? AUTO_INCREMENT = 1`, [tableName]);
        } catch (error) {
          // Some tables might not have AUTO_INCREMENT, ignore errors
        }
      }
      
      // Re-enable foreign key checks
      await connection.query('SET FOREIGN_KEY_CHECKS = 1');
      
      console.log(`\n✅ Data deletion completed!`);
      console.log(`   Total rows deleted: ${totalDeleted}`);
      console.log(`   Tables cleared: ${tables.length}`);
      console.log('\n💡 Tip: Run the admin setup script to recreate admin users:');
      console.log('   node scripts/run-admin-setup.js\n');
      
    } finally {
      connection.release();
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to clear data:', error);
    process.exit(1);
  }
}

clearAllData();

