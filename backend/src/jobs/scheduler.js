import cron from 'node-cron';
import pool from '../config/database.js';
import emailService from '../services/emailService.js';

// Daily reorder suggestions at 9 AM
cron.schedule('0 9 * * *', async () => {
  try {
    const [materials] = await pool.execute(`
      SELECT * FROM materials 
      WHERE current_stock <= reorder_level
    `);
    
    if (materials.length > 0) {
      console.log(`Found ${materials.length} materials needing reorder`);
      // Send notification to controllers
    }
  } catch (error) {
    console.error('Reorder check failed:', error);
  }
});

// Weekly financial report on Mondays at 8 AM
cron.schedule('0 8 * * 1', async () => {
  try {
    const [revenue] = await pool.execute(`
      SELECT SUM(amount) as weekly_revenue 
      FROM payments 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);
    
    console.log(`Weekly revenue: $${revenue[0].weekly_revenue || 0}`);
  } catch (error) {
    console.error('Weekly report failed:', error);
  }
});

// Daily backup reminder at 11 PM
cron.schedule('0 23 * * *', () => {
  console.log('Daily backup reminder - ensure database backup is completed');
});

// Overdue invoice reminders every day at 10 AM
cron.schedule('0 10 * * *', async () => {
  try {
    const [overdueInvoices] = await pool.execute(`
      SELECT i.*, c.email, c.name 
      FROM invoices i
      JOIN orders o ON i.order_id = o.id
      JOIN customers c ON o.customer_id = c.id
      WHERE i.status IN ('unpaid', 'partial') 
      AND i.created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);
    
    for (const invoice of overdueInvoices) {
      if (invoice.email) {
        await emailService.sendEmail(
          invoice.email,
          'Payment Reminder',
          `Dear ${invoice.name}, your invoice #${invoice.id} is overdue. Please make payment at your earliest convenience.`
        );
      }
    }
  } catch (error) {
    console.error('Overdue reminder failed:', error);
  }
});

console.log('Scheduled jobs initialized');