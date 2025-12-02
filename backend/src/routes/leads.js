import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import rbacMiddleware from '../../middleware/rbac.js';
import pool from '../config/database.js';

const router = express.Router();

router.use(authenticateToken, rbacMiddleware);

// Test route
router.get('/leads/test', (req, res) => {
  res.json({ message: 'Leads router is working' });
});

// Get all leads
router.get('/leads', async (req, res) => {
  try {
    const [leads] = await pool.execute('SELECT l.*, c.name as customer_name FROM leads l LEFT JOIN customers c ON l.customer_id = c.id ORDER BY l.id DESC');
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// Get lead by ID (including literal {id})
router.get('/leads/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (id === '{id}') {
      // Return first lead for literal {id}
      const [leads] = await pool.execute('SELECT l.*, c.name as customer_name FROM leads l LEFT JOIN customers c ON l.customer_id = c.id LIMIT 1');
      if (leads.length === 0) return res.status(404).json({ error: 'Lead not found' });
      
      const lead = leads[0];
      const [items] = await pool.execute('SELECT li.*, m.name as material_name FROM lead_items li LEFT JOIN materials m ON li.material_id = m.id WHERE li.lead_id = ?', [lead.id]);
      lead.items = items;
      
      return res.json(lead);
    }
    const [leads] = await pool.execute('SELECT l.*, c.name as customer_name FROM leads l LEFT JOIN customers c ON l.customer_id = c.id WHERE l.id = ?', [id]);
    if (leads.length === 0) return res.status(404).json({ error: 'Lead not found' });
    
    const lead = leads[0];
    const [items] = await pool.execute('SELECT li.*, m.name as material_name FROM lead_items li LEFT JOIN materials m ON li.material_id = m.id WHERE li.lead_id = ?', [lead.id]);
    lead.items = items;
    
    res.json(lead);
  } catch (error) {
    console.error('Fetch lead error:', error);
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
});

// Create lead
router.post('/leads', async (req, res) => {
  try {
    const { customer_id, channel, status, items } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO leads (customer_id, channel, status) VALUES (?, ?, ?)',
      [customer_id || null, channel || null, status || 'new']
    );
    
    const leadId = result.insertId;
    
    if (items && Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        if (item.material_id && item.quantity) {
             await pool.execute(
            'INSERT INTO lead_items (lead_id, material_id, quantity) VALUES (?, ?, ?)',
            [leadId, item.material_id, item.quantity]
          );
        }
      }
    }
    
    res.status(201).json({ id: leadId, customer_id, channel, status: status || 'new', items: items || [] });
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

// Update lead
router.put('/leads/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { customer_id, channel, status } = req.body;
    
    // Handle literal {id} - can't update, return error
    if (id === '{id}') {
      return res.status(400).json({ error: 'Cannot update with literal {id}' });
    }
    
    // Check if lead exists
    const [existing] = await pool.execute('SELECT id FROM leads WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    // Normalize channel to lowercase for enum
    const normalizedChannel = channel ? channel.toLowerCase() : null;
    
    await pool.execute(
      'UPDATE leads SET customer_id = ?, channel = ?, status = ? WHERE id = ?',
      [customer_id || null, normalizedChannel, status || 'new', id]
    );
    res.json({ id, customer_id, channel: normalizedChannel, status: status || 'new' });
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

// Get lead by customer ID
router.get('/leads/customer/:customerId', async (req, res) => {
  try {
    const [leads] = await pool.execute('SELECT l.*, c.name as customer_name FROM leads l LEFT JOIN customers c ON l.customer_id = c.id WHERE l.customer_id = ? LIMIT 1', [req.params.customerId]);
    if (leads.length === 0) return res.status(404).json({ error: 'Lead not found' });
    res.json(leads[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
});

// Delete lead
router.delete('/leads/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM leads WHERE id = ?', [req.params.id]);
    res.json({ message: 'Lead deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

export default router;