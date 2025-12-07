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
        poweredBy: 'Top Design'
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





// Public contact form endpoint (no auth required)
export const sendContactForm = async (req, res) => {
  try {
    const { name, email, company, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields: name, email, subject, message' });
    }

    // Email to admin
    const adminEmail = process.env.ADMIN_EMAIL || 'tabitakwizerisezerano@gmail.com';
    const adminMessage = `
      <h3>New Contact Form Submission</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
      <p><strong>Subject:</strong> ${subject}</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
      <p><strong>Message:</strong></p>
      <p style="white-space: pre-wrap;">${message}</p>
    `;

    const adminResult = await sendFreeEmail(adminEmail, `Contact Form: ${subject}`, adminMessage, 'business');

    // Confirmation email to user
    const userMessage = `
      <h3>Thank you for contacting TOP Design Ltd!</h3>
      <p>Dear ${name},</p>
      <p>We have received your message regarding "${subject}". Our team will get back to you as soon as possible.</p>
      <p>Best regards,<br>TOP Design Ltd Team</p>
    `;

    const userResult = await sendFreeEmail(email, 'Thank you for contacting TOP Design Ltd', userMessage, 'business');

    if (adminResult.success && userResult.success) {
      res.json({
        success: true,
        message: 'Message sent successfully! We will get back to you soon.',
        adminEmailSent: true,
        confirmationEmailSent: true
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send email. Please try again later.',
        adminEmailSent: adminResult.success,
        confirmationEmailSent: userResult.success,
        adminError: adminResult.error,
        userError: userResult.error
      });
    }
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Failed to send contact form' });
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
        '<h3>✅ Email service is working!</h3><p>This is a test message from Top Design system.</p>'
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