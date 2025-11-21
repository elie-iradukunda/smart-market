// Free communication services without API keys
import nodemailer from 'nodemailer';

// Free Email Service using Gmail SMTP
export const sendFreeEmail = async (to, subject, message) => {
  try {
    // Create Gmail transporter (free)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || 'your-email@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD || 'your-app-password'
      }
    });

    const mailOptions = {
      from: process.env.GMAIL_USER || 'Smart Market <your-email@gmail.com>',
      to: to,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">📧 Smart Market Notification</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
            ${message}
          </div>
          <p style="color: #7f8c8d; font-size: 12px; margin-top: 20px;">
            This is an automated message from Smart Market System
          </p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Email sending failed:', error);
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
        message: `📱 Smart Market: ${message}`,
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
        source: 'Smart Market System',
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
        username: 'Smart Market Bot',
        icon_emoji: ':robot_face:',
        text: message,
        attachments: [
          {
            color: 'good',
            fields: [
              {
                title: 'System',
                value: 'Smart Market Backend',
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
export const sendDiscordNotification = async (message, title = 'Smart Market Alert') => {
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
        username: 'Smart Market Bot',
        avatar_url: 'https://cdn-icons-png.flaticon.com/512/2040/2040946.png',
        embeds: [
          {
            title: title,
            description: message,
            color: 3447003, // Blue color
            timestamp: new Date().toISOString(),
            footer: {
              text: 'Smart Market System'
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
      subject = '📢 Smart Market Notification';
      message = `<p>${JSON.stringify(data, null, 2)}</p>`;
  }
  
  return await sendNotification('all', process.env.ADMIN_EMAIL || 'admin@smartmarket.com', subject, message);
};