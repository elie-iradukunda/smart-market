import { 
  sendNotification, 
  sendBusinessAlert,
  sendFreeEmail,
  sendFreeSMS,
  sendSlackNotification,
  sendDiscordNotification
} from '../services/freeCommunicationService.js';

// Send email notification
export const sendEmail = async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    
    if (!to || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, message' });
    }
    
    const result = await sendFreeEmail(to, subject, message);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Email sent successfully',
        messageId: result.messageId,
        service: 'Gmail SMTP (Free)',
        poweredBy: 'Smart Market'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Email controller error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
};

// Send SMS notification
export const sendSMS = async (req, res) => {
  try {
    const { phone, message } = req.body;
    
    if (!phone || !message) {
      return res.status(400).json({ error: 'Missing required fields: phone, message' });
    }
    
    const result = await sendFreeSMS(phone, message);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'SMS sent successfully',
        quotaRemaining: result.quotaRemaining,
        service: 'Textbelt (Free)'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('SMS controller error:', error);
    res.status(500).json({ error: 'Failed to send SMS' });
  }
};

// Send Slack notification
export const sendSlack = async (req, res) => {
  try {
    const { message, channel } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Missing required field: message' });
    }
    
    const result = await sendSlackNotification(message, channel);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Slack notification sent successfully',
        service: 'Slack Webhook (Free)'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Slack controller error:', error);
    res.status(500).json({ error: 'Failed to send Slack notification' });
  }
};

// Send Discord notification
export const sendDiscord = async (req, res) => {
  try {
    const { message, title } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Missing required field: message' });
    }
    
    const result = await sendDiscordNotification(message, title);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Discord notification sent successfully',
        service: 'Discord Webhook (Free)'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Discord controller error:', error);
    res.status(500).json({ error: 'Failed to send Discord notification' });
  }
};

// Send unified notification
export const sendUnifiedNotification = async (req, res) => {
  try {
    const { type, recipient, subject, message, options } = req.body;
    
    if (!type || !recipient || !message) {
      return res.status(400).json({ error: 'Missing required fields: type, recipient, message' });
    }
    
    const result = await sendNotification(type, recipient, subject, message, options);
    
    res.json({
      success: result.success,
      results: result.results,
      timestamp: result.timestamp,
      error: result.error
    });
  } catch (error) {
    console.error('Unified notification error:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
};

// Send business alert
export const sendAlert = async (req, res) => {
  try {
    const { alertType, data } = req.body;
    
    if (!alertType || !data) {
      return res.status(400).json({ error: 'Missing required fields: alertType, data' });
    }
    
    const result = await sendBusinessAlert(alertType, data);
    
    res.json({
      success: result.success,
      message: 'Business alert sent',
      results: result.results,
      error: result.error
    });
  } catch (error) {
    console.error('Business alert error:', error);
    res.status(500).json({ error: 'Failed to send business alert' });
  }
};

// Test all communication services
export const testCommunications = async (req, res) => {
  try {
    const testResults = [];
    
    // Test email
    try {
      const emailResult = await sendFreeEmail(
        process.env.ADMIN_EMAIL || 'test@example.com',
        '📧 Communication Test - Email',
        '<h3>✅ Email service is working!</h3><p>This is a test message from Smart Market system.</p>'
      );
      testResults.push({ service: 'Email (Gmail)', success: emailResult.success, error: emailResult.error });
    } catch (error) {
      testResults.push({ service: 'Email (Gmail)', success: false, error: error.message });
    }
    
    // Test SMS (if enabled)
    if (process.env.TEST_PHONE) {
      try {
        const smsResult = await sendFreeSMS(process.env.TEST_PHONE, 'Communication test - SMS service working!');
        testResults.push({ service: 'SMS (Textbelt)', success: smsResult.success, error: smsResult.error });
      } catch (error) {
        testResults.push({ service: 'SMS (Textbelt)', success: false, error: error.message });
      }
    }
    
    // Test Slack (if configured)
    if (process.env.SLACK_WEBHOOK_URL) {
      try {
        const slackResult = await sendSlackNotification('📱 Communication test - Slack service working!');
        testResults.push({ service: 'Slack', success: slackResult.success, error: slackResult.error });
      } catch (error) {
        testResults.push({ service: 'Slack', success: false, error: error.message });
      }
    }
    
    // Test Discord (if configured)
    if (process.env.DISCORD_WEBHOOK_URL) {
      try {
        const discordResult = await sendDiscordNotification('Communication test - Discord service working!', '📱 Test Alert');
        testResults.push({ service: 'Discord', success: discordResult.success, error: discordResult.error });
      } catch (error) {
        testResults.push({ service: 'Discord', success: false, error: error.message });
      }
    }
    
    res.json({
      message: 'Communication services tested',
      results: testResults,
      timestamp: new Date().toISOString(),
      totalServices: testResults.length,
      workingServices: testResults.filter(r => r.success).length
    });
    
  } catch (error) {
    console.error('Communication test error:', error);
    res.status(500).json({ error: 'Failed to test communication services' });
  }
};