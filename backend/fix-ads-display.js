import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_market',
};

async function fixAdsDisplay() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database\n');

    // Delete all old test/demo ads
    console.log('Deleting old test ads...');
    const [deleteResult] = await connection.execute(
      `DELETE FROM ads WHERE 
       title LIKE '%Top design%' 
       OR title LIKE '%Mufasa%'
       OR title LIKE '%Muhire%' 
       OR title LIKE '%test%' 
       OR title LIKE '%Test%'
       OR title LIKE '%Job%'
       OR description LIKE '%muhire%'
       OR description LIKE '%Mufasa%'
       OR description LIKE '%jobs%'`
    );
    console.log(`✓ Deleted ${deleteResult.affectedRows} old test ads\n`);

    // Get remaining professional ads
    const [ads] = await connection.execute(
      `SELECT id, title, display_order FROM ads 
       WHERE title IN (
         'Professional Design Services',
         'Premium Banner Printing',
         'Custom Printing Solutions',
         'Fast & Reliable Delivery',
         'Quality You Can Trust'
       )
       ORDER BY id ASC`
    );

    console.log(`Found ${ads.length} professional ads\n`);

    // Update display order to ensure proper sequence (1-5)
    console.log('Updating display order...');
    for (let i = 0; i < ads.length; i++) {
      await connection.execute(
        'UPDATE ads SET display_order = ? WHERE id = ?',
        [i + 1, ads[i].id]
      );
      console.log(`✓ Updated "${ads[i].title}" (ID: ${ads[i].id}) to display_order: ${i + 1}`);
    }

    // Verify final state
    const [finalAds] = await connection.execute(
      `SELECT id, title, display_order, is_active 
       FROM ads 
       WHERE is_active = true
       ORDER BY display_order ASC`
    );

    console.log('\n' + '='.repeat(80));
    console.log('\nFinal active ads (in display order):');
    finalAds.forEach((ad, index) => {
      console.log(`  ${index + 1}. "${ad.title}" (ID: ${ad.id}, Order: ${ad.display_order})`);
    });

    console.log('\n✅ Ads display fixed!');
    console.log(`\nTotal active ads: ${finalAds.length}`);
    console.log('The carousel will now show only professional ads in the correct order.');

  } catch (error) {
    console.error('Error fixing ads display:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

fixAdsDisplay();

