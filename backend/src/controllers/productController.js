import pool from '../config/database.js';

export const getProducts = async (req, res) => {
  try {
    const [products] = await pool.execute('SELECT * FROM products ORDER BY created_at DESC');
    
    // Convert local file paths to web URLs
    const productsWithUrls = products.map(product => {
      let imageUrl = product.image;
      
      // If image is a local file path, convert it to a web URL
      if (imageUrl && (imageUrl.includes('\\') || imageUrl.includes('C:'))) {
        // Extract just the filename from the path
        const filename = imageUrl.split('\\').pop() || imageUrl.split('/').pop();
        imageUrl = `http://localhost:3000/uploads/products/${filename}`;
      }
      
      return {
        ...product,
        image: imageUrl
      };
    });
    
    res.json(productsWithUrls);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const [products] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);
    
    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    let product = products[0];
    
    // Convert local file path to web URL
    if (product.image && (product.image.includes('\\') || product.image.includes('C:'))) {
      const filename = product.image.split('\\').pop() || product.image.split('/').pop();
      product.image = `http://localhost:3000/uploads/products/${filename}`;
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category, stock_quantity } = req.body;
    
    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO products (name, description, price, image, category, stock_quantity, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description, price, image, category, stock_quantity || 0, 'pending']
    );
    
    res.status(201).json({ 
      id: result.insertId, 
      name, description, price, image, category, stock_quantity, status: 'pending',
      message: 'Product created and pending approval' 
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, category, stock_quantity } = req.body;
    
    await pool.execute(
      'UPDATE products SET name = ?, description = ?, price = ?, image = ?, category = ?, stock_quantity = ?, status = ? WHERE id = ?',
      [name, description, price, image, category, stock_quantity, req.body.status || 'active', id]
    );
    
    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    
    await connection.beginTransaction();

    // Tables that use 'productId' as FK
    const tablesWithProductId = [
      'bookings', 'cartitems', 'favorites', 'houseinfos', 
      'landinfos', 'orderitems', 'rentalrequests', 'reviews', 'vehicleinfos'
    ];

    for (const table of tablesWithProductId) {
      try {
        await connection.execute(`DELETE FROM ${table} WHERE productId = ?`, [id]);
      } catch (e) {
        // Table might not exist or column might be different, log and continue
        console.warn(`Could not delete from ${table}:`, e.message);
      }
    }

    // Tables that use 'product_id' as FK
    await connection.execute('DELETE FROM ecommerce_order_items WHERE product_id = ?', [id]);
    
    // Finally delete the product
    const [result] = await connection.execute('DELETE FROM products WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Product not found' });
    }

    await connection.commit();
    res.json({ message: 'Product and all related records deleted successfully' });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error deleting product:', error);
    res.status(500).json({ 
      error: 'Failed to delete product',
      details: error.message 
    });
  } finally {
    if (connection) connection.release();
  }
};
export const approveProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.execute('UPDATE products SET status = ? WHERE id = ?', ['active', id]);
    
    res.json({ message: 'Product approved successfully' });
  } catch (error) {
    console.error('Error approving product:', error);
    res.status(500).json({ error: 'Failed to approve product' });
  }
};
