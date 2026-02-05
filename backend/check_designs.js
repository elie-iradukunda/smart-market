import pool from './src/config/database.js';

async function checkDesigns() {
  try {
    const [designs] = await pool.execute('SELECT id, title, preview_url FROM designs');
    console.log('Designs in database:');
    console.log(JSON.stringify(designs, null, 2));
    
    if (designs.length === 0) {
      console.log('\nNo designs found. Creating sample designs...');
      
      const sampleDesigns = [
        {
          title: 'Net',
          preview_url: '/uploads/products/product-1770251329054-828667082.jpg',
          category: 'SIGNBOARD',
          material: 'Flex Banner',
          price: 399
        },
        {
          title: 'MTN MOMO mos',
          preview_url: '/uploads/products/product-1770253587787-744754902.jpg',
          category: 'SIGNBOARD',
          material: 'PVC Board',
          price: 700
        },
        {
          title: 'T-shirt',
          preview_url: '/uploads/products/product-1770253744489-710651052.jpg',
          category: 'T-SHIRT',
          material: 'Vinyl Sticker',
          price: 8000
        },
        {
          title: 'Bank of kigali',
          preview_url: '/uploads/products/product-1770253757869-569859100.jpg',
          category: 'SIGNBOARD',
          material: 'Metal Sheet',
          price: 8000
        }
      ];
      
      for (const design of sampleDesigns) {
        await pool.execute(
          `INSERT INTO designs (title, description, category, width, height, unit, material, preview_url, colors, price, created_by, status) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [design.title, '', design.category, 1, 1, 'meters', design.material, design.preview_url, 'Full Color', design.price, 1, 'pending_review']
        );
      }
      
      console.log('Sample designs created!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDesigns();
