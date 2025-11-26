import pool from '../config/database.js';

export const getLeads = async (req, res) => {
  try {
    const [leads] = await pool.execute('SELECT l.*, c.name as customer_name FROM leads l LEFT JOIN customers c ON l.customer_id = c.id ORDER BY l.id DESC');
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
};

export const getLead = async (req, res) => {
  try {
    const [leads] = await pool.execute('SELECT l.*, c.name as customer_name FROM leads l LEFT JOIN customers c ON l.customer_id = c.id WHERE l.id = ?', [req.params.id]);
    if (leads.length === 0) return res.status(404).json({ error: 'Lead not found' });
    res.json(leads[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
};

export const getLeadsByCustomer = async (req, res) => {
  try {
    const [leads] = await pool.execute('SELECT l.*, c.name as customer_name FROM leads l LEFT JOIN customers c ON l.customer_id = c.id WHERE l.customer_id = ?', [req.params.customerId]);
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer leads' });
  }
};

export const createLead = async (req, res) => {
  try {
    const { customer_id, channel, status } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO leads (customer_id, channel, status) VALUES (?, ?, ?)',
      [customer_id || null, channel || null, status || 'new']
    );
    res.status(201).json({ id: result.insertId, customer_id, channel, status: status || 'new' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create lead' });
  }
};

export const updateLead = async (req, res) => {
  try {
    const { customer_id, channel, status } = req.body;
    await pool.execute(
      'UPDATE leads SET customer_id = ?, channel = ?, status = ? WHERE id = ?',
      [customer_id || null, channel || null, status, req.params.id]
    );
    res.json({ id: req.params.id, customer_id, channel, status });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update lead' });
  }
};

export const deleteLead = async (req, res) => {
  try {
    await pool.execute('DELETE FROM leads WHERE id = ?', [req.params.id]);
    res.json({ message: 'Lead deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete lead' });
  }
};