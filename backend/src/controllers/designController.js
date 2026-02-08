import pool from '../config/database.js';

export const createDesign = async (req, res) => {
    try {
        const { title, description, category, width, height, unit, material, preview_url, colors, price } = req.body;
        const userId = req.user.id;
        
        const [result] = await pool.execute(
            'INSERT INTO designs (title, description, category, width, height, unit, material, preview_url, colors, price, created_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [title, description || '', category, width || 0, height || 0, unit || 'meters', material, preview_url || '', colors || '', price || 0, userId, 'draft']
        );
        
        res.status(201).json({ id: result.insertId, message: 'Design created successfully' });
    } catch (error) {
        console.error('Create design error:', error);
        res.status(500).json({ error: 'Failed to create design' });
    }
};

export const getDesigns = async (req, res) => {
    try {
        console.log('GET /api/designs requested');
        
        let query = `
            SELECT d.*, u.name as designer_name 
            FROM designs d 
            LEFT JOIN users u ON d.created_by = u.id
        `;
        let params = [];

        // If user is authenticated and is admin/staff, show all. 
        // Otherwise, show only published designs.
        // req.user might be undefined if called from a public route.
        if (!req.user || (req.user.role_id !== 1 && req.user.role_id !== 2 && req.user.role_id !== 3)) {
            query += ' WHERE d.status = "published"';
        }

        query += ' ORDER BY d.created_at DESC';
        
        const [designs] = await pool.execute(query, params);
        console.log(`Found ${designs.length} designs`);
        res.json(designs || []);
    } catch (error) {
        console.error('Get designs error:', error);
        res.status(500).json({ error: 'Failed to fetch designs' });
    }
};

export const getDesign = async (req, res) => {
    try {
        const { id } = req.params;
        const [design] = await pool.execute(`
            SELECT d.*, u.name as designer_name 
            FROM designs d 
            LEFT JOIN users u ON d.created_by = u.id 
            WHERE d.id = ?
        `, [id]);
        
        if (design.length === 0) {
            return res.status(404).json({ error: 'Design not found' });
        }
        
        // If guest and design is not published, forbid access
        if (!req.user && design[0].status !== 'published') {
            return res.status(403).json({ error: 'Unauthorized access to unpublished design' });
        }
        
        res.json(design[0]);
    } catch (error) {
        console.error('Get design error:', error);
        res.status(500).json({ error: 'Failed to fetch design' });
    }
};

export const updateDesign = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, category, width, height, unit, material, preview_url, colors, price, status } = req.body;
        
        // If status is being updated to 'published', check if user is admin
        if (status === 'published' && req.user.role_id !== 1) {
            return res.status(403).json({ error: 'Only admins can publish designs' });
        }

        // Handle undefined values - convert to null or empty string
        const safeTitle = title || '';
        const safeDescription = description || '';
        const safeCategory = category || '';
        const safeWidth = width || 0;
        const safeHeight = height || 0;
        const safeUnit = unit || 'meters';
        const safeMaterial = material || '';
        const safePreviewUrl = preview_url || '';
        const safeColors = colors || '';
        const safePrice = price || 0;
        const safeStatus = status || 'draft';

        await pool.execute(
            'UPDATE designs SET title = ?, description = ?, category = ?, width = ?, height = ?, unit = ?, material = ?, preview_url = ?, colors = ?, price = ?, status = ? WHERE id = ?',
            [safeTitle, safeDescription, safeCategory, safeWidth, safeHeight, safeUnit, safeMaterial, safePreviewUrl, safeColors, safePrice, safeStatus, id]
        );
        
        res.json({ message: 'Design updated successfully' });
    } catch (error) {
        console.error('Update design error:', error);
        res.status(500).json({ error: 'Failed to update design' });
    }
};

export const approveDesign = async (req, res) => {
    try {
        const { id } = req.params;
        const { price, publishAsProduct } = req.body;
        
        // Check if user is admin (role_id: 1)
        if (req.user.role_id !== 1) {
            return res.status(403).json({ error: 'Unauthorized. Only admins can approve designs.' });
        }
        
        // Get the design details
        const [designs] = await pool.execute('SELECT * FROM designs WHERE id = ?', [id]);
        if (designs.length === 0) {
            return res.status(404).json({ error: 'Design not found' });
        }
        
        const design = designs[0];
        
        // Update design status and price
        if (price !== undefined) {
          await pool.execute('UPDATE designs SET status = ?, price = ? WHERE id = ?', ['published', price, id]);
        } else {
          await pool.execute('UPDATE designs SET status = ? WHERE id = ?', ['published', id]);
        }

        // If publishAsProduct is true, create a product in the e-commerce catalog
        if (publishAsProduct) {
            const productPrice = price || design.price;
            const productName = design.title;
            const productDescription = `${design.description}\n\nSpecifications:\n- Category: ${design.category}\n- Dimensions: ${design.width}x${design.height} ${design.unit}\n- Material: ${design.material}\n- Colors: ${design.colors}`;
            
            await pool.execute(
                `INSERT INTO Products (name, description, price, category, image, stock_quantity, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                [productName, productDescription, productPrice, design.category, design.preview_url, 999]
            );
        }

        res.json({ 
            message: publishAsProduct 
                ? 'Design approved and published as product!' 
                : 'Design approved and published!' 
        });
    } catch (error) {
        console.error('Approve design error:', error);
        res.status(500).json({ error: 'Failed to approve design' });
    }
};

export const deleteDesign = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.execute('DELETE FROM designs WHERE id = ?', [id]);
        res.json({ message: 'Design deleted' });
    } catch (error) {
        console.error('Delete design error:', error);
        res.status(500).json({ error: 'Failed to delete design' });
    }
};
