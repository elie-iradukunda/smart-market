// Free communication services without API keys
import nodemailer from 'nodemailer';

// Email Template Designs
const getEmailTemplate = (type, message) => {
  const templates = {
    default: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">📧 Top Design Notification</h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          ${message}
        </div>
        <p style="color: #7f8c8d; font-size: 12px; margin-top: 20px;">
          This is an automated message from Top Design System
        </p>
      </div>
    `,
    
    business: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 650px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🏢 Top Design</h1>
          <p style="color: #e8f4fd; margin: 5px 0 0 0;">Business Management Platform</p>
        </div>
        <div style="padding: 40px 30px; background: #f9fafb;">
          ${message}
        </div>
        <div style="background: #374151; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">Powered by Top Design System</p>
        </div>
      </div>
    `,
    
    modern: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb;">
        <div style="background: #1f2937; padding: 25px; border-bottom: 4px solid #3b82f6;">
          <h2 style="color: #ffffff; margin: 0; font-weight: 600;">⚡ Top Design</h2>
        </div>
        <div style="padding: 35px 25px;">
          <div style="background: #f3f4f6; padding: 25px; border-left: 4px solid #3b82f6; margin-bottom: 20px;">
            ${message}
          </div>
        </div>
        <div style="background: #f9fafb; padding: 15px 25px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; margin: 0; font-size: 11px;">© Top Design - Professional Business Solutions</p>
        </div>
      </div>
    `,
    
    minimal: `
      <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <div style="border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 30px;">
          <h3 style="margin: 0; color: #000; font-weight: 300;">Top Design</h3>
        </div>
        <div style="line-height: 1.6; color: #333;">
          ${message}
        </div>
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 11px; margin: 0;">Top Design System</p>
        </div>
      </div>
    `
  };
  
  return templates[type] || templates.default;
};

// Free Email Service using Gmail SMTP
export const sendFreeEmail = async (to, subject, message, template = 'default') => {
  const GMAIL_USER = process.env.GMAIL_USER || '';
  const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || '';
  
  // Check if email credentials are configured
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD || GMAIL_USER === 'your-email@gmail.com' || GMAIL_APP_PASSWORD === 'your-app-password') {
    console.warn('⚠️ GMAIL_USER or GMAIL_APP_PASSWORD not configured. Email not sent to:', to);
    console.warn('Please set GMAIL_USER and GMAIL_APP_PASSWORD in your .env file');
    return { 
      success: false, 
      error: 'Email service not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD environment variables.' 
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD
      }
    });

    const mailOptions = {
      from: `TOP Design Ltd <${GMAIL_USER}>`,
      to: to,
      subject: subject,
      html: getEmailTemplate(template, message)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    console.error('Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
    return { success: false, error: error.message };
  }
};

// Free SMS Service using Textbelt (1 free SMS per day)
export const sendFreeSMS = async (phone, message) => {
  try {
    const response = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: phone,
        message: `📱 Top Design: ${message}`,
        key: 'textbelt' // Free tier key
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ SMS sent successfully');
      return { success: true, quotaRemaining: result.quotaRemaining };
    } else {
      console.log('❌ SMS failed:', result.error);
      return { success: false, error: result.error };
    }
    
  } catch (error) {
    console.error('❌ SMS service error:', error);
    return { success: false, error: error.message };
  }
};

// Free Push Notifications using Web Push
export const sendWebPushNotification = async (subscription, title, body, data = {}) => {
  try {
    const payload = JSON.stringify({
      title: title,
      body: body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: data,
      actions: [
        {
          action: 'view',
          title: 'View Details'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    });

    // This would use web-push library in production
    console.log('📱 Web push notification prepared:', { title, body });
    return { success: true, payload };
    
  } catch (error) {
    console.error('❌ Web push error:', error);
    return { success: false, error: error.message };
  }
};

// Free Webhook Notifications
export const sendWebhookNotification = async (webhookUrl, data) => {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        source: 'Top Design System',
        ...data
      })
    });

    if (response.ok) {
      console.log('✅ Webhook notification sent');
      return { success: true };
    } else {
      throw new Error(`Webhook failed: ${response.status}`);
    }
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return { success: false, error: error.message };
  }
};

// Free Slack Notifications (using Slack Incoming Webhooks)
export const sendSlackNotification = async (message, channel = '#general') => {
  try {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    
    if (!webhookUrl) {
      throw new Error('Slack webhook URL not configured');
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: channel,
        username: 'Top Design Bot',
        icon_emoji: ':robot_face:',
        text: message,
        attachments: [
          {
            color: 'good',
            fields: [
              {
                title: 'System',
                value: 'Top Design Backend',
                short: true
              },
              {
                title: 'Timestamp',
                value: new Date().toISOString(),
                short: true
              }
            ]
          }
        ]
      })
    });

    if (response.ok) {
      console.log('✅ Slack notification sent');
      return { success: true };
    } else {
      throw new Error(`Slack API error: ${response.status}`);
    }
    
  } catch (error) {
    console.error('❌ Slack notification error:', error);
    return { success: false, error: error.message };
  }
};

// Free Discord Notifications (using Discord Webhooks)
export const sendDiscordNotification = async (message, title = 'Top Design Alert') => {
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    
    if (!webhookUrl) {
      throw new Error('Discord webhook URL not configured');
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'Top Design Bot',
        avatar_url: 'https://cdn-icons-png.flaticon.com/512/2040/2040946.png',
        embeds: [
          {
            title: title,
            description: message,
            color: 3447003, // Blue color
            timestamp: new Date().toISOString(),
            footer: {
              text: 'Top Design System'
            }
          }
        ]
      })
    });

    if (response.ok) {
      console.log('✅ Discord notification sent');
      return { success: true };
    } else {
      throw new Error(`Discord API error: ${response.status}`);
    }
    
  } catch (error) {
    console.error('❌ Discord notification error:', error);
    return { success: false, error: error.message };
  }
};

// Unified Communication Service
export const sendNotification = async (type, recipient, subject, message, options = {}) => {
  const results = [];
  
  try {
    switch (type) {
      case 'email':
        const emailResult = await sendFreeEmail(recipient, subject, message);
        results.push({ type: 'email', ...emailResult });
        break;
        
      case 'sms':
        const smsResult = await sendFreeSMS(recipient, message);
        results.push({ type: 'sms', ...smsResult });
        break;
        
      case 'slack':
        const slackResult = await sendSlackNotification(message, options.channel);
        results.push({ type: 'slack', ...slackResult });
        break;
        
      case 'discord':
        const discordResult = await sendDiscordNotification(message, subject);
        results.push({ type: 'discord', ...discordResult });
        break;
        
      case 'webhook':
        const webhookResult = await sendWebhookNotification(recipient, { subject, message, ...options });
        results.push({ type: 'webhook', ...webhookResult });
        break;
        
      case 'all':
        // Send to all available channels
        if (process.env.GMAIL_USER) {
          const emailResult = await sendFreeEmail(recipient, subject, message);
          results.push({ type: 'email', ...emailResult });
        }
        
        if (process.env.SLACK_WEBHOOK_URL) {
          const slackResult = await sendSlackNotification(`${subject}: ${message}`);
          results.push({ type: 'slack', ...slackResult });
        }
        
        if (process.env.DISCORD_WEBHOOK_URL) {
          const discordResult = await sendDiscordNotification(message, subject);
          results.push({ type: 'discord', ...discordResult });
        }
        break;
        
      default:
        throw new Error(`Unknown notification type: ${type}`);
    }
    
    return {
      success: true,
      results: results,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Notification service error:', error);
    return {
      success: false,
      error: error.message,
      results: results
    };
  }
};

// Business-specific notification templates
export const sendBusinessAlert = async (alertType, data) => {
  let subject, message;
  
  switch (alertType) {
    case 'low_inventory':
      subject = '🚨 Low Inventory Alert';
      message = `
        <h3>⚠️ Inventory Alert</h3>
        <p><strong>${data.material_name}</strong> is running low:</p>
        <ul>
          <li>Current Stock: ${data.current_stock} ${data.unit}</li>
          <li>Reorder Level: ${data.reorder_level} ${data.unit}</li>
          <li>Days Until Reorder: ${data.days_until_reorder}</li>
        </ul>
        <p><strong>Action Required:</strong> Place reorder immediately</p>
      `;
      break;
      
    case 'new_order':
      subject = '📋 New Order Received';
      message = `
        <h3>🎉 New Order Alert</h3>
        <p>New order from <strong>${data.customer_name}</strong>:</p>
        <ul>
          <li>Order ID: #${data.order_id}</li>
          <li>Amount: $${data.total_amount}</li>
          <li>Status: ${data.status}</li>
        </ul>
        <p><strong>Next Step:</strong> Process order and update customer</p>
      `;
      break;
      
    case 'customer_churn_risk':
      subject = '⚠️ Customer Churn Risk Alert';
      message = `
        <h3>🚨 Customer At Risk</h3>
        <p><strong>${data.customer_name}</strong> shows high churn risk:</p>
        <ul>
          <li>Churn Probability: ${Math.round(data.churn_probability * 100)}%</li>
          <li>Days Since Last Order: ${data.days_since_last_order}</li>
          <li>Total Orders: ${data.total_orders}</li>
        </ul>
        <p><strong>Action Required:</strong> Contact customer immediately</p>
      `;
      break;
      
    default:
      subject = '📢 Top Design Notification';
      message = `<p>${JSON.stringify(data, null, 2)}</p>`;
  }
  
  return await sendNotification('all', process.env.ADMIN_EMAIL || 'admin@smartmarket.com', subject, message);
};