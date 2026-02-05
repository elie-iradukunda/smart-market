import pool from './src/config/database.js';

async function updateDesignImages() {
  try {
    // Update existing designs with proper image URLs
    const updates = [
      { id: 1, title: 'Bank of kigali', preview_url: '/uploads/products/product-1770253757869-569859100.jpg' },
      { id: 2, title: 'T-shirt', preview_url: '/uploads/products/product-1770253744489-710651052.jpg' },
      { id: 3, title: 'MTN MOMO mos', preview_url: '/uploads/products/product-1770253587787-744754902.jpg' },
      { id: 4, title: 'Net', preview_url: '/uploads/products/product-1770251329054-828667082.jpg' }
    ];
    
    for (const design of updates) {
      await pool.execute(
        'UPDATE designs SET preview_url = ? WHERE id = ?',
        [design.preview_url, design.id]
      );
      console.log(`Updated ${design.title} with image: ${design.preview_url}`);
    }
    
    console.log('\nAll designs updated!');
    
    // Verify
    const [designs] = await pool.execute('SELECT id, title, preview_url FROM designs');
    console.log('\nCurrent designs:');
    designs.forEach(d => {
      console.log(`  ${d.id}. ${d.title}: ${d.preview_url}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateDesignImages();
