import pool from '../config/database.js';
import path from 'path';
import fs from 'fs/promises';

// Get all ads (public endpoint - for displaying on homepage)
export const getAllAds = async (req, res) => {
  try {
    const [ads] = await pool.execute(
      `SELECT id, title, description, image_url, link_url, button_text, 
              background_color, text_color, display_order, impressions, clicks
       FROM ads 
       WHERE is_active = true 
         AND (start_date IS NULL OR start_date <= CURDATE())
         AND (end_date IS NULL OR end_date >= CURDATE())
       ORDER BY display_order ASC, created_at DESC`
    );
    res.json(ads);
  } catch (error) {
    console.error('Error fetching ads:', error);
    res.status(500).json({ error: 'Failed to fetch ads' });
  }
};

// Get all ads for management (includes inactive)
export const getAdsForManagement = async (req, res) => {
  try {
    const [ads] = await pool.execute(
      `SELECT a.*, u.name as created_by_name
       FROM ads a
       LEFT JOIN users u ON a.created_by = u.id
       ORDER BY a.created_at DESC`
    );
    res.json(ads);
  } catch (error) {
    console.error('Error fetching ads for management:', error);
    res.status(500).json({ error: 'Failed to fetch ads' });
  }
};

// Get single ad
export const getAd = async (req, res) => {
  try {
    const { id } = req.params;
    const [ads] = await pool.execute(
      `SELECT a.*, u.name as created_by_name
       FROM ads a
       LEFT JOIN users u ON a.created_by = u.id
       WHERE a.id = ?`,
      [id]
    );
    
    if (ads.length === 0) {
      return res.status(404).json({ error: 'Ad not found' });
    }
    
    res.json(ads[0]);
  } catch (error) {
    console.error('Error fetching ad:', error);
    res.status(500).json({ error: 'Failed to fetch ad' });
  }
};

// Create new ad
export const createAd = async (req, res) => {
  try {
    const {
      title,
      description,
      image_url,
      link_url,
      button_text,
      background_color,
      text_color,
      start_date,
      end_date,
      is_active,
      display_order
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const created_by = req.user.id;

    const [result] = await pool.execute(
      `INSERT INTO ads (
        title, description, image_url, link_url, button_text,
        background_color, text_color, start_date, end_date,
        is_active, display_order, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description || null,
        image_url || null,
        link_url || null,
        button_text || 'Learn More',
        background_color || '#4F46E5',
        text_color || '#FFFFFF',
        start_date || null,
        end_date || null,
        is_active !== undefined ? is_active : true,
        display_order || 0,
        created_by
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Ad created successfully',
      ad_id: result.insertId
    });
  } catch (error) {
    console.error('Error creating ad:', error);
    res.status(500).json({ error: 'Failed to create ad' });
  }
};

// Update ad
export const updateAd = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      image_url,
      link_url,
      button_text,
      background_color,
      text_color,
      start_date,
      end_date,
      is_active,
      display_order
    } = req.body;

    // Check if ad exists
    const [existing] = await pool.execute('SELECT id FROM ads WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    await pool.execute(
      `UPDATE ads SET
        title = ?,
        description = ?,
        image_url = ?,
        link_url = ?,
        button_text = ?,
        background_color = ?,
        text_color = ?,
        start_date = ?,
        end_date = ?,
        is_active = ?,
        display_order = ?
      WHERE id = ?`,
      [
        title,
        description,
        image_url,
        link_url,
        button_text,
        background_color,
        text_color,
        start_date,
        end_date,
        is_active,
        display_order,
        id
      ]
    );

    res.json({
      success: true,
      message: 'Ad updated successfully'
    });
  } catch (error) {
    console.error('Error updating ad:', error);
    res.status(500).json({ error: 'Failed to update ad' });
  }
};

// Delete ad
export const deleteAd = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if ad exists
    const [existing] = await pool.execute('SELECT id, image_url FROM ads WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    // Delete the ad
    await pool.execute('DELETE FROM ads WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Ad deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting ad:', error);
    res.status(500).json({ error: 'Failed to delete ad' });
  }
};

// Track ad impression
export const trackImpression = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute(
      'UPDATE ads SET impressions = impressions + 1 WHERE id = ?',
      [id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking impression:', error);
    res.status(500).json({ error: 'Failed to track impression' });
  }
};

// Track ad click
export const trackClick = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute(
      'UPDATE ads SET clicks = clicks + 1 WHERE id = ?',
      [id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).json({ error: 'Failed to track click' });
  }
};

// Toggle ad active status
export const toggleAdStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const [ads] = await pool.execute('SELECT is_active FROM ads WHERE id = ?', [id]);
    if (ads.length === 0) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    const newStatus = !ads[0].is_active;
    await pool.execute('UPDATE ads SET is_active = ? WHERE id = ?', [newStatus, id]);

    res.json({
      success: true,
      message: `Ad ${newStatus ? 'activated' : 'deactivated'} successfully`,
      is_active: newStatus
    });
  } catch (error) {
    console.error('Error toggling ad status:', error);
    res.status(500).json({ error: 'Failed to toggle ad status' });
  }
};
