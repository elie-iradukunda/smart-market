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

async function checkAds() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database\n');

    // Get all active ads
    const [ads] = await connection.execute(
      `SELECT id, title, description, is_active, display_order, 
              background_color, text_color, start_date, end_date,
              created_at
       FROM ads 
       ORDER BY display_order ASC, created_at DESC`
    );

    console.log(`Total ads in database: ${ads.length}\n`);

    if (ads.length === 0) {
      console.log('No ads found in database.');
      return;
    }

    console.log('All Ads:');
    console.log('='.repeat(80));
    ads.forEach((ad, index) => {
      console.log(`\n${index + 1}. ID: ${ad.id}`);
      console.log(`   Title: "${ad.title}"`);
      console.log(`   Description: "${ad.description || 'N/A'}"`);
      console.log(`   Active: ${ad.is_active ? 'YES ✓' : 'NO ✗'}`);
      console.log(`   Display Order: ${ad.display_order}`);
      console.log(`   Background: ${ad.background_color}`);
      console.log(`   Text Color: ${ad.text_color}`);
      console.log(`   Start Date: ${ad.start_date || 'None'}`);
      console.log(`   End Date: ${ad.end_date || 'None'}`);
      console.log(`   Created: ${ad.created_at}`);
    });

    // Get active ads that should be showing
    const [activeAds] = await connection.execute(
      `SELECT id, title, description, is_active, display_order
       FROM ads 
       WHERE is_active = true 
         AND (start_date IS NULL OR start_date <= CURDATE())
         AND (end_date IS NULL OR end_date >= CURDATE())
       ORDER BY display_order ASC, created_at DESC`
    );

    console.log('\n' + '='.repeat(80));
    console.log(`\nActive ads that should be showing: ${activeAds.length}`);
    activeAds.forEach((ad, index) => {
      console.log(`  ${index + 1}. "${ad.title}" (ID: ${ad.id}, Order: ${ad.display_order})`);
    });

  } catch (error) {
    console.error('Error checking ads:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkAds();

