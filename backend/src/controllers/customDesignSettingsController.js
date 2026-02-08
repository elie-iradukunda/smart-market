import pool from '../config/database.js';

export const getCustomDesignSettings = async (req, res) => {
    try {
        const [settings] = await pool.execute('SELECT * FROM custom_design_settings WHERE is_active = TRUE ORDER BY id ASC');
        res.json(settings);
    } catch (error) {
        console.error('Error fetching custom design settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
};

export const getAllCustomDesignSettings = async (req, res) => {
    try {
        const [settings] = await pool.execute('SELECT * FROM custom_design_settings ORDER BY id ASC');
        res.json(settings);
    } catch (error) {
        console.error('Error fetching all custom design settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
};

export const updateCustomDesignSetting = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price_per_sqm, is_active } = req.body;
        
        await pool.execute(
            'UPDATE custom_design_settings SET name = ?, description = ?, price_per_sqm = ?, is_active = ? WHERE id = ?',
            [name, description, price_per_sqm, is_active, id]
        );
        
        res.json({ message: 'Setting updated successfully' });
    } catch (error) {
        console.error('Error updating custom design setting:', error);
        res.status(500).json({ error: 'Failed to update setting' });
    }
};

export const createCustomDesignSetting = async (req, res) => {
    try {
        const { product_key, name, description, price_per_sqm } = req.body;
        
        const [result] = await pool.execute(
            'INSERT INTO custom_design_settings (product_key, name, description, price_per_sqm) VALUES (?, ?, ?, ?)',
            [product_key, name, description, price_per_sqm]
        );
        
        res.status(201).json({ id: result.insertId, message: 'New product type created successfully' });
    } catch (error) {
        console.error('Error creating custom design setting:', error);
        res.status(500).json({ error: 'Failed to create product type' });
    }
};

export const deleteCustomDesignSetting = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.execute('DELETE FROM custom_design_settings WHERE id = ?', [id]);
        res.json({ message: 'Product type deleted' });
    } catch (error) {
        console.error('Error deleting custom design setting:', error);
        res.status(500).json({ error: 'Failed to delete product type' });
    }
};
