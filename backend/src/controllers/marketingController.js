import pool from '../config/database.js';

export const createCampaign = async (req, res) => {
  try {
    const { name, platform, budget } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO campaigns (name, platform, budget) VALUES (?, ?, ?)',
      [name, platform, budget]
    );
    res.status(201).json({ id: result.insertId, message: 'Campaign created' });
  } catch (error) {
    res.status(500).json({ error: 'Campaign creation failed' });
  }
};

export const getCampaigns = async (req, res) => {
  try {
    const [campaigns] = await pool.execute('SELECT * FROM campaigns ORDER BY created_at DESC');
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
};

export const getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT * FROM campaigns WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
};

export const recordAdPerformance = async (req, res) => {
  try {
    const { campaign_id, impressions, clicks, conversions, cost_spent, date } = req.body;
    
    await pool.execute(
      'INSERT INTO ad_performance (campaign_id, impressions, clicks, conversions, cost_spent, date) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE impressions = ?, clicks = ?, conversions = ?, cost_spent = ?',
      [campaign_id, impressions, clicks, conversions, cost_spent, date, impressions, clicks, conversions, cost_spent]
    );
    
    res.json({ message: 'Performance data recorded' });
  } catch (error) {
    res.status(500).json({ error: 'Performance recording failed' });
  }
};

export const getCampaignPerformance = async (req, res) => {
  try {
    const { id } = req.params;
    const [performance] = await pool.execute(
      'SELECT * FROM ad_performance WHERE campaign_id = ? ORDER BY date DESC',
      [id]
    );
    res.json(performance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch performance data' });
  }
};