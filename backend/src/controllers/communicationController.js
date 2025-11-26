import { 
  sendFreeEmail
} from '../services/freeCommunicationService.js';

// Send email notification
export const sendEmail = async (req, res) => {
  try {
    const { to, subject, message, template } = req.body;
    
    if (!to || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, message' });
    }
    
    const result = await sendFreeEmail(to, subject, message, template);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Email sent successfully',
        messageId: result.messageId,
        template: template || 'default',
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





// Test communication services
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