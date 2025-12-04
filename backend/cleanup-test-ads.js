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

async function cleanupTestAds() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database');

    // Find test ads (you can customize this query)
    const [ads] = await connection.execute(
      `SELECT id, title, description FROM ads 
       WHERE title LIKE '%Muhire%' 
          OR title LIKE '%Top design%'
          OR title LIKE '%Mufasa%'
          OR title LIKE '%test%' 
          OR title LIKE '%Test%'
          OR title LIKE '%Job%'
          OR description LIKE '%muhire%'
          OR description LIKE '%Mufasa%'
          OR description LIKE '%jobs%'`
    );

    if (ads.length === 0) {
      console.log('No test ads found to delete.');
      return;
    }

    console.log(`Found ${ads.length} test ad(s):`);
    ads.forEach(ad => {
      console.log(`  - ID: ${ad.id}, Title: "${ad.title}", Description: "${ad.description}"`);
    });

    // Delete test ads
    for (const ad of ads) {
      await connection.execute('DELETE FROM ads WHERE id = ?', [ad.id]);
      console.log(`✓ Deleted ad ID ${ad.id}: "${ad.title}"`);
    }

    console.log('\n✓ Cleanup completed successfully!');
  } catch (error) {
    console.error('Error cleaning up test ads:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

cleanupTestAds();

