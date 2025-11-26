import pool from '../config/database.js';
import { sendFreeEmail } from '../services/freeCommunicationService.js';

// Broadcast message to all customers
export const broadcastToAllCustomers = async (req, res) => {
  try {
    const { subject, message, campaign_name } = req.body;
    
    if (!subject || !message || !campaign_name) {
      return res.status(400).json({ error: 'Missing required fields: subject, message, campaign_name' });
    }
    
    // Create campaign record
    const [campaignResult] = await pool.execute(
      'INSERT INTO campaigns (title, subject, message, platform) VALUES (?, ?, ?, ?)',
      [campaign_name, subject, message, 'email']
    );
    
    const campaignId = campaignResult.insertId;
    
    // Get all customers with email
    const [customers] = await pool.execute(
      'SELECT id, name, email FROM customers WHERE email IS NOT NULL AND email != ""'
    );
    
    let sent = 0;
    let failed = 0;
    
    // Send to each customer
    for (const customer of customers) {
      try {
        const result = await sendFreeEmail(
          customer.email,
          subject,
          `<h3>Hello ${customer.name},</h3>${message}`
        );
        
        if (result.success) {
          sent++;
          console.log(`✅ Email sent to ${customer.email}`);
        } else {
          failed++;
          console.log(`❌ Failed to send to ${customer.email}: ${result.error}`);
        }
      } catch (error) {
        failed++;
        console.error(`Failed to send to ${customer.email}:`, error);
      }
    }
    
    // Update campaign with results
    await pool.execute(
      'UPDATE campaigns SET sent_count = ?, failed_count = ? WHERE id = ?',
      [sent, failed, campaignId]
    );
    
    console.log(`Campaign ${campaignId} completed: ${sent} sent, ${failed} failed`);
    
    res.json({
      success: true,
      campaign_id: campaignId,
      message: 'Broadcast completed',
      sent: sent,
      failed: failed,
      total_customers: customers.length,
      poweredBy: 'Smart Market'
    });
    
  } catch (error) {
    console.error('Broadcast error:', error);
    res.status(500).json({ error: 'Broadcast failed' });
  }
};

// Broadcast to specific customer segment
export const broadcastToSegment = async (req, res) => {
  try {
    const { subject, message, campaign_name, segment } = req.body;
    
    if (!subject || !message || !campaign_name || !segment) {
      return res.status(400).json({ error: 'Missing required fields: subject, message, campaign_name, segment' });
    }
    
    // Create campaign record
    const [campaignResult] = await pool.execute(
      'INSERT INTO campaigns (title, subject, message, platform) VALUES (?, ?, ?, ?)',
      [campaign_name, subject, message, 'email']
    );
    
    const campaignId = campaignResult.insertId;
    
    // Get customers based on segment
    let customerQuery = 'SELECT id, name, email FROM customers WHERE email IS NOT NULL AND email != ""';
    let queryParams = [];
    
    if (segment === 'recent') {
      customerQuery += ' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
    } else if (segment === 'active') {
      customerQuery += ' AND id IN (SELECT DISTINCT customer_id FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY))';
    } else if (segment === 'inactive') {
      customerQuery += ' AND id NOT IN (SELECT DISTINCT customer_id FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 180 DAY))';
    }
    
    const [customers] = await pool.execute(customerQuery, queryParams);
    
    let sent = 0;
    let failed = 0;
    
    // Send to each customer in segment
    for (const customer of customers) {
      try {
        const result = await sendFreeEmail(
          customer.email,
          subject,
          `<h3>Hello ${customer.name},</h3>${message}`
        );
        
        if (result.success) {
          sent++;
          console.log(`✅ Email sent to ${customer.email}`);
        } else {
          failed++;
          console.log(`❌ Failed to send to ${customer.email}: ${result.error}`);
        }
      } catch (error) {
        failed++;
        console.error(`Failed to send to ${customer.email}:`, error);
      }
    }
    
    // Update campaign with results
    await pool.execute(
      'UPDATE campaigns SET sent_count = ?, failed_count = ? WHERE id = ?',
      [sent, failed, campaignId]
    );
    
    console.log(`Campaign ${campaignId} completed: ${sent} sent, ${failed} failed`);
    
    res.json({
      success: true,
      campaign_id: campaignId,
      message: `Broadcast to ${segment} customers completed`,
      sent: sent,
      failed: failed,
      total_customers: customers.length,
      poweredBy: 'Smart Market'
    });
    
  } catch (error) {
    console.error('Segment broadcast error:', error);
    res.status(500).json({ error: 'Segment broadcast failed' });
  }
};

// Get all campaigns
export const getCampaigns = async (req, res) => {
  try {
    const [campaigns] = await pool.execute(
      'SELECT * FROM campaigns ORDER BY created_at DESC'
    );
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
};

// Get single campaign with details
export const getCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [campaign] = await pool.execute(
      'SELECT * FROM campaigns WHERE id = ?',
      [id]
    );
    
    if (campaign.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    res.json(campaign[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
};
