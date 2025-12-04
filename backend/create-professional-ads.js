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

// Professional ads for TOP Design business
const professionalAds = [
  {
    title: 'Professional Design Services',
    description: 'Transform your vision into stunning designs. From logos to complete brand identity, we bring creativity to life.',
    image_url: null, // Will use gradient background
    link_url: '/products',
    button_text: 'Explore Services',
    background_color: '#7C3AED', // Purple
    text_color: '#FFFFFF',
    start_date: null, // Active immediately
    end_date: null, // No end date
    is_active: true,
    display_order: 1,
  },
  {
    title: 'Premium Banner Printing',
    description: 'High-quality banners for events, promotions, and advertising. Fast turnaround, competitive prices.',
    image_url: null,
    link_url: '/products?category=Banners',
    button_text: 'Order Now',
    background_color: '#0EA5E9', // Blue
    text_color: '#FFFFFF',
    start_date: null,
    end_date: null,
    is_active: true,
    display_order: 2,
  },
  {
    title: 'Custom Printing Solutions',
    description: 'From business cards to large format printing. We handle all your printing needs with precision and care.',
    image_url: null,
    link_url: '/products?category=Printing',
    button_text: 'Get Started',
    background_color: '#10B981', // Green
    text_color: '#FFFFFF',
    start_date: null,
    end_date: null,
    is_active: true,
    display_order: 3,
  },
  {
    title: 'Fast & Reliable Delivery',
    description: 'Need it urgently? We offer express printing services with same-day or next-day delivery options.',
    image_url: null,
    link_url: '/products',
    button_text: 'Learn More',
    background_color: '#F59E0B', // Orange
    text_color: '#FFFFFF',
    start_date: null,
    end_date: null,
    is_active: true,
    display_order: 4,
  },
  {
    title: 'Quality You Can Trust',
    description: 'Rwanda\'s premier design agency. Over 10 years of excellence in design and printing services.',
    image_url: null,
    link_url: '/about',
    button_text: 'About Us',
    background_color: '#EC4899', // Pink
    text_color: '#FFFFFF',
    start_date: null,
    end_date: null,
    is_active: true,
    display_order: 5,
  },
];

async function createProfessionalAds() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database');

    // First, check for existing product images we can use
    const [products] = await connection.execute(
      'SELECT image FROM products WHERE image IS NOT NULL AND image != "" AND image LIKE "%/uploads/%" LIMIT 5'
    );

    console.log(`Found ${products.length} product images available`);
    if (products.length > 0) {
      products.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.image}`);
      });
    }

    // Check if we have a user with role_id 10 (Marketing Manager) or 1 (Owner)
    const [users] = await connection.execute(
      'SELECT id FROM users WHERE role_id IN (1, 10) LIMIT 1'
    );

    const created_by = users.length > 0 ? users[0].id : 1; // Default to user 1 if no marketing manager found
    console.log(`Using user ID ${created_by} as creator`);

    // Delete old test ads first
    console.log('\nCleaning up test ads...');
    await connection.execute(
      `DELETE FROM ads WHERE title LIKE '%Muhire%' 
       OR title LIKE '%test%' 
       OR title LIKE '%Test%'
       OR description LIKE '%muhire%'
       OR description LIKE '%jobs%'`
    );
    console.log('✓ Test ads cleaned up');

    // Delete existing professional ads to avoid duplicates
    console.log('\nRemoving old professional ads...');
    await connection.execute(
      `DELETE FROM ads WHERE title IN (?, ?, ?, ?, ?)`,
      professionalAds.map(ad => ad.title)
    );
    console.log('✓ Old ads removed');

    // Create new professional ads
    console.log('\nCreating professional ads...');
    let imageIndex = 0;

    for (const ad of professionalAds) {
      // Use product image if available
      let imageUrl = ad.image_url;
      if (!imageUrl && products.length > 0 && imageIndex < products.length) {
        const productImage = products[imageIndex].image;
        // Normalize image path
        if (productImage) {
          // If it's already a relative path starting with /uploads
          if (productImage.startsWith('/uploads/')) {
            imageUrl = productImage;
          }
          // If it contains /uploads/, extract the path
          else if (productImage.includes('/uploads/')) {
            const parts = productImage.split('/uploads/');
            imageUrl = `/uploads/${parts[parts.length - 1]}`;
          }
          // If it's a full URL, skip it (use gradient instead)
          else if (productImage.startsWith('http')) {
            imageUrl = null;
          }
          // Otherwise assume it's a relative path
          else {
            imageUrl = productImage.startsWith('/') ? productImage : `/${productImage}`;
          }
        }
        imageIndex++;
      }

      const [result] = await connection.execute(
        `INSERT INTO ads (
          title, description, image_url, link_url, button_text,
          background_color, text_color, start_date, end_date,
          is_active, display_order, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          ad.title,
          ad.description,
          imageUrl,
          ad.link_url,
          ad.button_text,
          ad.background_color,
          ad.text_color,
          ad.start_date,
          ad.end_date,
          ad.is_active,
          ad.display_order,
          created_by
        ]
      );

      console.log(`✓ Created ad: "${ad.title}" (ID: ${result.insertId})`);
      if (imageUrl) {
        console.log(`  └─ Using image: ${imageUrl}`);
      }
    }

    console.log('\n✅ Successfully created professional ads!');
    console.log(`\nTotal ads created: ${professionalAds.length}`);
    console.log('\nAds are now active and will appear on the homepage carousel.');

  } catch (error) {
    console.error('Error creating professional ads:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

createProfessionalAds();

