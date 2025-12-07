import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Email configuration from environment variables
const GMAIL_USER = process.env.GMAIL_USER || 'smartmarket399@gmail.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'tabitakwizerisezerano@gmail.com';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || '';
const COMPANY_NAME = process.env.COMPANY_NAME || 'Top Design';
const COMPANY_PHONE = process.env.COMPANY_PHONE || '+250 700 000 000';
const COMPANY_ADDRESS = process.env.COMPANY_ADDRESS || 'Kigali, Rwanda';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
      },
    });
  }

  // Base email sending method
  async sendEmail(to, subject, content, from = GMAIL_USER) {
    if (!GMAIL_APP_PASSWORD) {
      console.warn('GMAIL_APP_PASSWORD not configured. Email not sent to:', to);
      return { message: 'Email not sent - GMAIL_APP_PASSWORD not configured' };
    }

    try {
      const mailOptions = {
        from: `${COMPANY_NAME} <${from}>`,
        to: to,
        subject: subject,
        html: content,
        dkim: process.env.DKIM_PRIVATE_KEY ? {
          domainName: from.split('@')[1],
          keySelector: 'default',
          privateKey: process.env.DKIM_PRIVATE_KEY
        } : undefined
      };
      
      console.log(`Sending email to: ${to}, subject: ${subject}`);
      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${to}, messageId: ${result.messageId}`);
      return result;
    } catch (error) {
      console.error('Email sending failed:', {
        to,
        subject,
        error: error.message,
        stack: error.stack
      });
      return { error: error.message };
    }
  }

  // Invoice Email
  async sendInvoice(customerEmail, invoiceData) {
    const subject = `Invoice #${invoiceData.id} - Top Design`;
    const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice #${invoiceData.id}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">TOP DESIGN</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Professional Printing Services</p>
        </div>
        
        <!-- Invoice Header -->
        <div style="padding: 30px; border-bottom: 2px solid #f0f0f0;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <h2 style="margin: 0; color: #333; font-size: 24px;">INVOICE</h2>
              <p style="margin: 5px 0 0 0; color: #666; font-size: 16px;">#${invoiceData.id}</p>
            </div>
            <div style="margin-left: 40px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span style="color: #666; font-size: 14px; width: 60px;">Date:</span>
                <span style="color: #333; font-size: 14px; font-weight: 500;">${new Date().toLocaleDateString()}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #666; font-size: 14px; width: 60px;">Due:</span>
                <span style="color: #333; font-size: 14px; font-weight: 500;">${new Date(invoiceData.due_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Invoice Details -->
        <div style="padding: 30px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">Invoice Summary</h3>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #666;">Subtotal:</span>
              <span style="color: #333; font-weight: bold;">${invoiceData.amount.toLocaleString()} RWF</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #666;">Tax (0%):</span>
              <span style="color: #333;">0 RWF</span>
            </div>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
            <div style="display: flex; justify-content: space-between; font-size: 20px;">
              <span style="color: #333; font-weight: bold;">Total Amount:</span>
              <span style="color: #28a745; font-weight: bold;">${invoiceData.amount.toLocaleString()} RWF</span>
            </div>
          </div>
          
          <!-- Payment Instructions -->
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745;">
            <h4 style="margin: 0 0 10px 0; color: #155724;">💳 Payment Instructions</h4>
            <p style="margin: 0; color: #155724; line-height: 1.5;">Please make payment by the due date. You can pay via cash, check, or bank transfer. Contact us for payment details.</p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
          <h3 style="margin: 0 0 15px 0; color: #333;">Thank you for your business! </h3>
          <p style="margin: 0 0 10px 0; color: #666;">Top Design - Your trusted printing partner</p>
          <div style="margin-top: 20px;">
            <p style="margin: 0; color: #999; font-size: 12px;"> ${GMAIL_USER} |  Contact us for support</p>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
    return this.sendEmail(customerEmail, subject, content);
  }

  // Payment Confirmation Email
  async sendPaymentConfirmation(customerEmail, paymentData) {
    const subject = `Payment Confirmation - Invoice #${paymentData.invoice_id}`;
    const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">PAYMENT CONFIRMATION</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Thank you for your payment</p>
        </div>
        
        <!-- Payment Details -->
        <div style="padding: 30px;">
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin-bottom: 30px;">
            <h2 style="margin: 0 0 15px 0; color: #28a745; font-size: 24px;">Payment Received</h2>
            <p style="margin: 0; color: #155724; line-height: 1.5;">Thank you for your payment. We've received your payment of <strong>${paymentData.amount.toLocaleString()} RWF</strong> for Invoice #${paymentData.invoice_id}.</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">Payment Details</h3>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #666;">Invoice #:</span>
              <span style="color: #333; font-weight: bold;">${paymentData.invoice_id}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #666;">Amount Paid:</span>
              <span style="color: #28a745; font-weight: bold;">${paymentData.amount.toLocaleString()} RWF</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #666;">Payment Method:</span>
              <span style="color: #333; text-transform: capitalize;">${paymentData.method}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #666;">Transaction ID:</span>
              <span style="color: #333; font-family: monospace;">${paymentData.transaction_id || 'N/A'}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #666;">Date:</span>
              <span style="color: #333;">${new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="margin: 0; color: #666; font-size: 14px;">A copy of this receipt has been sent to ${customerEmail}</p>
          <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;
    return this.sendEmail(customerEmail, subject, content);
  }

  // Quote Email
  async sendQuote(customerEmail, quoteData) {
    const itemsHtml = quoteData.items.map(item => 
      `<tr>
        <td style="padding: 12px 8px; border-bottom: 1px solid #eee; vertical-align: top;">${item.description}</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #eee; text-align: center; vertical-align: top;">${item.quantity}</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #eee; text-align: right; vertical-align: top;">${item.unit_price.toLocaleString()} RWF</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #eee; text-align: right; vertical-align: top; font-weight: bold;">${(item.quantity * item.unit_price).toLocaleString()} RWF</td>
      </tr>`
    ).join('');

    const subject = `Your Quote #${quoteData.quote_id} - ${COMPANY_NAME}`;
    const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Quote #${quoteData.quote_id}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">YOUR QUOTE</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Quote #${quoteData.quote_id}</p>
        </div>
        
        <!-- Quote Details -->
        <div style="padding: 30px;">
          <p style="margin: 0 0 20px 0; color: #666; line-height: 1.6;">Dear ${quoteData.customer_name},</p>
          <p style="margin: 0 0 20px 0; color: #666; line-height: 1.6;">Thank you for your interest in our services. We're pleased to provide you with the following quote:</p>
          
          <div style="margin: 30px 0; overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #28a745;">Description</th>
                  <th style="padding: 12px 8px; text-align: center; border-bottom: 2px solid #28a745; width: 60px;">Qty</th>
                  <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #28a745; width: 100px;">Unit Price</th>
                  <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #28a745; width: 100px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="text-align: right; padding: 12px 8px; border-top: 2px solid #28a745; font-weight: bold;">Subtotal:</td>
                  <td style="text-align: right; padding: 12px 8px; border-top: 2px solid #28a745; font-weight: bold;">${quoteData.subtotal.toLocaleString()} RWF</td>
                </tr>
                ${quoteData.tax ? `
                <tr>
                  <td colspan="3" style="text-align: right; padding: 12px 8px; font-weight: bold;">Tax (${quoteData.tax_rate || 0}%):</td>
                  <td style="text-align: right; padding: 12px 8px; font-weight: bold;">${quoteData.tax.toLocaleString()} RWF</td>
                </tr>
                ` : ''}
                <tr>
                  <td colspan="3" style="text-align: right; padding: 12px 8px; font-size: 18px; font-weight: bold; color: #28a745;">Total Amount:</td>
                  <td style="text-align: right; padding: 12px 8px; font-size: 18px; font-weight: bold; color: #28a745;">${quoteData.total_amount.toLocaleString()} RWF</td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #28a745;">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">Quote Details</h3>
            <p style="margin: 0 0 10px 0; color: #666;"><strong>Quote #:</strong> ${quoteData.quote_id}</p>
            <p style="margin: 0 0 10px 0; color: #666;"><strong>Valid Until:</strong> ${new Date(quoteData.valid_until).toLocaleDateString()}</p>
            <p style="margin: 0 0 10px 0; color: #666;"><strong>Prepared For:</strong> ${quoteData.customer_name}</p>
            ${quoteData.notes ? `<p style="margin: 15px 0 0 0; padding-top: 10px; border-top: 1px solid #eee; color: #666;"><strong>Notes:</strong> ${quoteData.notes}</p>` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://smartmarket.rw'}/accept-quote/${quoteData.quote_id}" 
               style="display: inline-block; background-color: #28a745; color: white; text-decoration: none; padding: 12px 30px; border-radius: 4px; font-weight: bold; font-size: 16px;">
              Accept This Quote
            </a>
            <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">or contact us at ${GMAIL_USER} for any questions</p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="margin: 0; color: #666; font-size: 14px;">${COMPANY_NAME} | ${COMPANY_PHONE} | ${COMPANY_ADDRESS}</p>
          <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
    `;
    return this.sendEmail(customerEmail, subject, content);
  }

  // Quote Approval Email
  async sendQuoteApproval(customerEmail, approvalData) {
    const subject = `Quote #${approvalData.quote_id} Approved - Next Steps`;
    const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Quote Approved - #${approvalData.quote_id}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">QUOTE APPROVED</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Thank you for your business!</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          <p style="margin: 0 0 20px 0; color: #666; line-height: 1.6;">Dear ${approvalData.customer_name},</p>
          <p style="margin: 0 0 20px 0; color: #666; line-height: 1.6;">Thank you for approving Quote #${approvalData.quote_id}. We're excited to get started on your order!</p>
          
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #28a745;">
            <h3 style="margin: 0 0 15px 0; color: #155724; font-size: 20px;">What Happens Next?</h3>
            <ol style="margin: 0; padding-left: 20px; color: #155724;">
              <li style="margin-bottom: 10px;">Our team will review your approved quote and begin processing your order.</li>
              <li style="margin-bottom: 10px;">You'll receive updates on the status of your order via email.</li>
              <li>Once completed, we'll notify you when your order is ready for pickup or delivery.</li>
            </ol>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">Order Summary</h3>
            <p style="margin: 0 0 10px 0; color: #666;"><strong>Quote #:</strong> ${approvalData.quote_id}</p>
            <p style="margin: 0 0 10px 0; color: #666;"><strong>Order Total:</strong> ${approvalData.total_amount.toLocaleString()} RWF</p>
            <p style="margin: 0 0 10px 0; color: #666;"><strong>Approval Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <p style="margin: 0 0 20px 0; color: #666; line-height: 1.6;">If you have any questions about your order, please reply to this email or contact us at ${GMAIL_USER}.</p>
          
          <p style="margin: 0 0 20px 0; color: #666; line-height: 1.6;">Thank you for choosing ${COMPANY_NAME}!</p>
          
          <p style="margin: 0; color: #666; line-height: 1.6;">Best regards,<br>The ${COMPANY_NAME} Team</p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="margin: 0; color: #666; font-size: 14px;">${COMPANY_NAME} | ${COMPANY_PHONE} | ${COMPANY_ADDRESS}</p>
          <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
    `;
    return this.sendEmail(customerEmail, subject, content);
  }

  // Work Order Assignment Email
  async sendWorkOrderAssignment(technicianEmail, workOrderData) {
    const subject = `New Work Order Assigned: #${workOrderData.work_order_id}`;
    const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Work Order #${workOrderData.work_order_id}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">NEW WORK ORDER</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Work Order #${workOrderData.work_order_id}</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          <p style="margin: 0 0 20px 0; color: #666; line-height: 1.6;">Hello ${workOrderData.technician_name},</p>
          <p style="margin: 0 0 20px 0; color: #666; line-height: 1.6;">You have been assigned a new work order. Please review the details below:</p>
          
          <div style="background-color: #e7f8ff; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #17a2b8;">
            <h3 style="margin: 0 0 15px 0; color: #0c5460; font-size: 20px;">Work Order Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 120px;"><strong>Work Order #:</strong></td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${workOrderData.work_order_id}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Customer:</strong></td>
                <td style="padding: 8px 0; color: #333;">${workOrderData.customer_name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; vertical-align: top;"><strong>Description:</strong></td>
                <td style="padding: 8px 0; color: #333;">${workOrderData.description || 'No description provided'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Priority:</strong></td>
                <td style="padding: 8px 0; color: #333; text-transform: capitalize;">${workOrderData.priority || 'Normal'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Due Date:</strong></td>
                <td style="padding: 8px 0; color: #333;">${new Date(workOrderData.due_date).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; vertical-align: top;"><strong>Notes:</strong></td>
                <td style="padding: 8px 0; color: #333;">${workOrderData.notes || 'No additional notes'}</td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.ADMIN_URL || 'https://admin.smartmarket.rw'}/work-orders/${workOrderData.work_order_id}" 
               style="display: inline-block; background-color: #17a2b8; color: white; text-decoration: none; padding: 12px 25px; border-radius: 4px; font-weight: bold;">
              View Work Order
            </a>
          </div>
          
          <p style="margin: 0; color: #666; line-height: 1.6;">If you have any questions about this work order, please contact your supervisor.</p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="margin: 0; color: #666; font-size: 14px;">${COMPANY_NAME} | Production Department</p>
          <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">This is an automated notification. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
    `;
    return this.sendEmail(technicianEmail, subject, content);
  }

  // Order Status Update Email
  async sendOrderStatusUpdate(customerEmail, statusData) {
    const statusInfo = {
      'pending': {
        title: 'Order Received',
        message: 'We have received your order and it is being processed.',
        color: '#17a2b8'
      },
      'processing': {
        title: 'Order in Progress',
        message: 'Your order is currently being processed by our team.',
        color: '#17a2b8'
      },
      'shipped': {
        title: 'Order Shipped',
        message: 'Your order has been shipped and is on its way to you!',
        color: '#28a745'
      },
      'delivered': {
        title: 'Order Delivered',
        message: 'Your order has been successfully delivered!',
        color: '#28a745'
      },
      'cancelled': {
        title: 'Order Cancelled',
        message: 'Your order has been cancelled as per your request.',
        color: '#dc3545'
      },
      'on_hold': {
        title: 'Order On Hold',
        message: 'Your order is currently on hold. We will contact you shortly.',
        color: '#ffc107'
      }
    }[statusData.status] || {
      title: 'Order Status Updated',
      message: 'The status of your order has been updated.',
      color: '#6c757d'
    };

    const subject = `Order #${statusData.order_id} - ${statusInfo.title}`;
    const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order #${statusData.order_id} - ${statusInfo.title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, ${statusInfo.color} 0%, #138496 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">ORDER ${statusInfo.title.toUpperCase()}</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Order #${statusData.order_id}</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          <p style="margin: 0 0 20px 0; color: #666; line-height: 1.6;">Hello ${statusData.customer_name || 'Valued Customer'},</p>
          <p style="margin: 0 0 20px 0; color: #666; line-height: 1.6;">${statusInfo.message}</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid ${statusInfo.color};">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">Order Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 120px;"><strong>Order #:</strong></td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${statusData.order_id}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Status:</strong></td>
                <td style="padding: 8px 0;">
                  <span style="display: inline-block; background-color: ${statusInfo.color}20; color: ${statusInfo.color}; padding: 4px 10px; border-radius: 4px; font-weight: bold; text-transform: capitalize;">
                    ${statusData.status.replace(/_/g, ' ')}
                  </span>
                </td>
              </tr>
              ${statusData.estimated_completion ? `
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Est. Completion:</strong></td>
                <td style="padding: 8px 0; color: #333;">${new Date(statusData.estimated_completion).toLocaleDateString()}</td>
              </tr>
              ` : ''}
              ${statusData.tracking_number ? `
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Tracking #:</strong></td>
                <td style="padding: 8px 0; color: #333; font-family: monospace;">${statusData.tracking_number}</td>
              </tr>
              ` : ''}
              ${statusData.notes ? `
              <tr>
                <td style="padding: 8px 0; color: #666; vertical-align: top;"><strong>Notes:</strong></td>
                <td style="padding: 8px 0; color: #333;">${statusData.notes}</td>
              </tr>
              ` : ''}
            </table>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://smartmarket.rw'}/orders/${statusData.order_id}" 
               style="display: inline-block; background-color: ${statusInfo.color}; color: white; text-decoration: none; padding: 12px 25px; border-radius: 4px; font-weight: bold;">
              View Order Status
            </a>
          </div>
          
          <p style="margin: 0; color: #666; line-height: 1.6;">If you have any questions about your order, please reply to this email or contact our support team.</p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="margin: 0; color: #666; font-size: 14px;">${COMPANY_NAME} | ${COMPANY_PHONE} | ${COMPANY_ADDRESS}</p>
          <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
    `;
    return this.sendEmail(customerEmail, subject, content);
  }

  // Admin Order Notification
  async sendOrderNotification(adminEmail, orderData) {
    const subject = `New Order #${orderData.order_id} - ${orderData.customer_name || 'New Customer'}`;
    const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order #${orderData.order_id}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">NEW ORDER RECEIVED</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Order #${orderData.order_id}</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          <p style="margin: 0 0 20px 0; color: #666; line-height: 1.6;">A new order has been placed and requires your attention.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #28a745;">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 120px;"><strong>Order #:</strong></td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${orderData.order_id}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Customer:</strong></td>
                <td style="padding: 8px 0; color: #333;">${orderData.customer_name || 'Guest'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Email:</strong></td>
                <td style="padding: 8px 0; color: #333;">${orderData.customer_email || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Phone:</strong></td>
                <td style="padding: 8px 0; color: #333;">${orderData.customer_phone || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; vertical-align: top;"><strong>Items:</strong></td>
                <td style="padding: 8px 0; color: #333;">
                  <ul style="margin: 0; padding-left: 20px;">
                    ${orderData.items ? orderData.items.map(item => 
                      `<li>${item.quantity} × ${item.name} - ${item.price.toLocaleString()} RWF</li>`
                    ).join('') : 'No items listed'}
                  </ul>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Total Amount:</strong></td>
                <td style="padding: 8px 0; color: #28a745; font-weight: bold; font-size: 16px;">${orderData.total_amount.toLocaleString()} RWF</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Payment Method:</strong></td>
                <td style="padding: 8px 0; color: #333; text-transform: capitalize;">${orderData.payment_method || 'Not specified'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Order Date:</strong></td>
                <td style="padding: 8px 0; color: #333;">${new Date(orderData.order_date).toLocaleString()}</td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.ADMIN_URL || 'https://admin.smartmarket.rw'}/orders/${orderData.order_id}" 
               style="display: inline-block; background-color: #28a745; color: white; text-decoration: none; padding: 12px 25px; border-radius: 4px; font-weight: bold;">
              View Order in Dashboard
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="margin: 0; color: #666; font-size: 14px;">${COMPANY_NAME} Admin Notification</p>
          <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">This is an automated notification. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
    `;
    return this.sendEmail(adminEmail, subject, content, GMAIL_USER);
  }

  // Supplier Welcome Email
  async sendSupplierWelcome(to, data) {
    const subject = `Welcome to ${COMPANY_NAME} - Supplier Registration Confirmation`;
    const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to ${COMPANY_NAME}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">WELCOME TO ${COMPANY_NAME.toUpperCase()}</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Supplier Registration Confirmation</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          <p style="margin: 0 0 20px 0; color: #666; line-height: 1.6;">Dear ${data.contact_name || 'Valued Supplier'},</p>
          <p style="margin: 0 0 20px 0; color: #666; line-height: 1.6;">Welcome to the ${COMPANY_NAME} supplier network! We have successfully registered your company in our system.</p>
          <p style="margin: 0 0 20px 0; color: #666; line-height: 1.6;">Please review the details we have on file for you below:</p>
          
          <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #28a745;">
            <h3 style="margin: 0 0 20px 0; color: #155724; font-size: 18px; border-bottom: 1px solid #e9ecef; padding-bottom: 10px;">Company Information</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 140px;"><strong>Company Name:</strong></td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${data.company_name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Contact Person:</strong></td>
                <td style="padding: 8px 0; color: #333;">${data.contact_name || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Email:</strong></td>
                <td style="padding: 8px 0; color: #333;">${to}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Phone:</strong></td>
                <td style="padding: 8px 0; color: #333;">${data.phone || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; vertical-align: top;"><strong>Address:</strong></td>
                <td style="padding: 8px 0; color: #333;">
                  ${data.address || ''}<br>
                  ${data.city ? data.city + ', ' : ''}${data.country || ''}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Tax ID:</strong></td>
                <td style="padding: 8px 0; color: #333;">${data.tax_id || 'N/A'}</td>
              </tr>
            </table>

            <h3 style="margin: 25px 0 20px 0; color: #155724; font-size: 18px; border-bottom: 1px solid #e9ecef; padding-bottom: 10px;">Financial Details</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 140px;"><strong>Payment Terms:</strong></td>
                <td style="padding: 8px 0; color: #333; text-transform: capitalize;">${(data.payment_terms || 'net_30').replace('_', ' ')}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Bank Name:</strong></td>
                <td style="padding: 8px 0; color: #333;">${data.bank_name || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Bank Account:</strong></td>
                <td style="padding: 8px 0; color: #333;">${data.bank_account || 'N/A'}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <p style="margin: 0; color: #155724; font-size: 14px;">
              <strong>Note:</strong> If any of these details are incorrect, please reply to this email immediately so we can update our records.
            </p>
          </div>
          
          <p style="margin: 0 0 20px 0; color: #666; line-height: 1.6;">We look forward to a successful partnership!</p>
          
          <p style="margin: 0; color: #666; line-height: 1.6;">Best regards,<br>The ${COMPANY_NAME} Procurement Team</p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="margin: 0; color: #666; font-size: 14px;">${COMPANY_NAME} | Supplier Relations</p>
          <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
    `;
    return this.sendEmail(to, subject, content);
  }


  // Purchase Order Email
  async sendPurchaseOrder(to, data) {
    // Format currency
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-RW', { 
        style: 'currency', 
        currency: 'RWF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0 
      }).format(amount);
    };

    // Format date
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('en-US', options);
    };

    // Payment terms mapping
    const paymentTermsMap = {
      'prepaid': 'Prepaid (100% payment in advance)',
      'net_7': 'Net 7 Days',
      'net_15': 'Net 15 Days',
      'net_30': 'Net 30 Days',
      'net_60': 'Net 60 Days',
      'cod': 'Cash on Delivery (COD)'
    };

    // Items table
    const itemsHtml = data.items && data.items.length > 0 ? `
      <table style="width: 100%; border-collapse: collapse; margin: 25px 0; font-size: 14px;">
        <thead>
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #28a745; background-color: #f1f8ff;">Item Description</th>
            <th style="padding: 12px; text-align: center; border-bottom: 2px solid #28a745; width: 80px; background-color: #f1f8ff;">Qty</th>
            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #28a745; width: 120px; background-color: #f1f8ff;">Unit Price</th>
            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #28a745; width: 120px; background-color: #f1f8ff;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${data.items.map((item, index) => `
            <tr style="${index % 2 === 0 ? 'background-color: #f9f9f9;' : ''}">
              <td style="padding: 15px 12px; border-bottom: 1px solid #e0e0e0; vertical-align: top;">
                <div style="font-weight: 600; color: #2c3e50; margin-bottom: 4px;">${item.material_name || 'Item ' + (index + 1)}</div>
                ${item.material_unit ? `<div style="color: #7f8c8d; font-size: 13px;">Unit: ${item.material_unit}</div>` : ''}
                ${item.notes ? `<div style="color: #7f8c8d; font-size: 13px; margin-top: 4px; font-style: italic;">${item.notes}</div>` : ''}
              </td>
              <td style="padding: 15px 12px; border-bottom: 1px solid #e0e0e0; text-align: center; vertical-align: top;">
                ${parseFloat(item.quantity).toFixed(2)}
              </td>
              <td style="padding: 15px 12px; border-bottom: 1px solid #e0e0e0; text-align: right; vertical-align: top; font-family: 'Courier New', monospace;">
                ${formatCurrency(item.unit_price)}
              </td>
              <td style="padding: 15px 12px; border-bottom: 1px solid #e0e0e0; text-align: right; vertical-align: top; font-family: 'Courier New', monospace; font-weight: 600;">
                ${formatCurrency(item.quantity * item.unit_price)}
              </td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding: 12px; text-align: right; border-top: 2px solid #28a745; font-weight: 600; background-color: #f8f9fa;">Subtotal:</td>
            <td style="padding: 12px; text-align: right; border-top: 2px solid #28a745; font-weight: 600; background-color: #f8f9fa; font-family: 'Courier New', monospace;">
              ${formatCurrency(data.subtotal || 0)}
            </td>
          </tr>
          ${data.tax ? `
          <tr>
            <td colspan="3" style="padding: 8px 12px; text-align: right; font-weight: 500; background-color: #f8f9fa;">
              Tax (${data.tax_rate || 18}%):
            </td>
            <td style="padding: 8px 12px; text-align: right; font-weight: 500; background-color: #f8f9fa; font-family: 'Courier New', monospace;">
              ${formatCurrency(data.tax || 0)}
            </td>
          </tr>
          ` : ''}
          <tr>
            <td colspan="3" style="padding: 15px 12px; text-align: right; font-size: 16px; font-weight: 700; color: #2c3e50; background-color: #f1f8ff; border-top: 2px solid #28a745;">
              TOTAL AMOUNT DUE:
            </td>
            <td style="padding: 15px 12px; text-align: right; font-size: 16px; font-weight: 700; color: #2c3e50; background-color: #f1f8ff; border-top: 2px solid #28a745; font-family: 'Courier New', monospace;">
              ${formatCurrency(data.total_amount || data.total || 0)}
            </td>
          </tr>
        </tfoot>
      </table>
    ` : '';

    const subject = `[${COMPANY_NAME}] Purchase Order #${data.reference_number || data.po_number || 'PO-' + new Date().getTime()}`;
    const poNumber = data.reference_number || data.po_number || 'PO-' + new Date().getTime();
    const orderDate = data.order_date ? new Date(data.order_date) : new Date();
    const deliveryDate = data.expected_delivery ? new Date(data.expected_delivery) : new Date();
    
    const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Purchase Order #${poNumber} - ${COMPANY_NAME}</title>
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Roboto', Arial, sans-serif; background-color: #f5f7fa; color: #333; line-height: 1.6;">
      <!-- Email Container -->
      <div style="max-width: 700px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <!-- Header with Company Info -->
        <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0 0 10px 0; font-size: 28px; font-weight: 700; letter-spacing: 1px;">PURCHASE ORDER</h1>
          <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 8px 20px; border-radius: 20px; margin-top: 10px;">
            <span style="font-size: 14px; font-weight: 500; letter-spacing: 0.5px;">PO #${poNumber}</span>
          </div>
        </div>
        
        <!-- Order Summary -->
        <div style="padding: 30px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
          <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
            <div style="margin-bottom: 20px;">
              <h3 style="margin: 0 0 12px 0; color: #2d3748; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Ordered By</h3>
              <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <p style="margin: 0 0 8px 0; font-weight: 600; color: #2d3748;">${COMPANY_NAME}</p>
                <p style="margin: 0 0 4px 0; color: #4a5568; font-size: 14px;">${COMPANY_ADDRESS}</p>
                <p style="margin: 0 0 4px 0; color: #4a5568; font-size: 14px;">${COMPANY_PHONE}</p>
                <p style="margin: 0; color: #4a5568; font-size: 14px;">${GMAIL_USER}</p>
              </div>
            </div>
            
            <div style="margin-bottom: 20px; text-align: right;">
              <h3 style="margin: 0 0 12px 0; color: #2d3748; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Supplier</h3>
              <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); display: inline-block; text-align: left;">
                <p style="margin: 0 0 8px 0; font-weight: 600; color: #2d3748;">${data.supplier_name || 'Supplier Name'}</p>
                ${data.supplier_contact ? `<p style="margin: 0 0 4px 0; color: #4a5568; font-size: 14px;">${data.supplier_contact}</p>` : ''}
                ${data.supplier_phone ? `<p style="margin: 0 0 4px 0; color: #4a5568; font-size: 14px;">${data.supplier_phone}</p>` : ''}
                <p style="margin: 0; color: #4a5568; font-size: 14px;">${to}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Order Details -->
        <div style="padding: 0 30px 20px 30px;
          <div style="margin: 25px 0 30px 0;">
            <div style="display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 20px;">
              <div style="flex: 1; min-width: 200px;">
                <div style="margin-bottom: 8px; font-size: 13px; color: #718096; font-weight: 500;">PO Number</div>
                <div style="font-weight: 600; color: #2d3748;">${poNumber}</div>
              </div>
              <div style="flex: 1; min-width: 200px;">
                <div style="margin-bottom: 8px; font-size: 13px; color: #718096; font-weight: 500;">Order Date</div>
                <div style="font-weight: 500; color: #2d3748;">${formatDate(orderDate)}</div>
              </div>
              <div style="flex: 1; min-width: 200px;">
                <div style="margin-bottom: 8px; font-size: 13px; color: #718096; font-weight: 500;">Requested Delivery</div>
                <div style="font-weight: 500; color: #2d3748;">${formatDate(deliveryDate)}</div>
              </div>
              <div style="flex: 1; min-width: 200px;">
                <div style="margin-bottom: 8px; font-size: 13px; color: #718096; font-weight: 500;">Payment Terms</div>
                <div style="font-weight: 500; color: #2d3748;">${paymentTermsMap[data.payment_terms] || data.payment_terms || 'Net 30 Days'}</div>
              </div>
            </div>
            
            <div style="margin-top: 15px;">
              <div style="margin-bottom: 8px; font-size: 13px; color: #718096; font-weight: 500;">Delivery Address</div>
              <div style="background: #f8fafc; padding: 12px 15px; border-radius: 6px; border: 1px solid #e2e8f0;">
                <p style="margin: 0 0 5px 0; font-weight: 500; color: #2d3748;">${data.delivery_address || COMPANY_ADDRESS}</p>
                ${data.delivery_instructions ? `
                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #e2e8f0;">
                  <div style="font-size: 13px; color: #718096; margin-bottom: 4px;">Special Instructions:</div>
                  <p style="margin: 0; font-size: 14px; color: #4a5568; font-style: italic;">${data.delivery_instructions}</p>
                </div>
                ` : ''}
              </div>
            </div>
            
            ${data.notes ? `
            <div style="margin-top: 15px;">
              <div style="margin-bottom: 8px; font-size: 13px; color: #718096; font-weight: 500;">Additional Notes</div>
              <div style="background: #fff8f0; padding: 15px; border-radius: 6px; border-left: 4px solid #ed8936;">
                <p style="margin: 0; color: #dd6b20; font-size: 14px; line-height: 1.6;">${data.notes}</p>
              </div>
            </div>
            ` : ''}
          </div>
          
          <!-- Order Items -->
          <h3 style="margin: 0 0 15px 0; color: #2d3748; font-size: 18px; font-weight: 600; padding-bottom: 10px; border-bottom: 2px solid #e2e8f0;">
            Order Items
          </h3>
          ${itemsHtml}
          
          <!-- Order Summary -->
          <div style="margin-top: 40px; padding: 20px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
            <h3 style="margin: 0 0 15px 0; color: #2d3748; font-size: 16px; font-weight: 600;">Order Summary</h3>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dashed #e2e8f0;">
              <div style="font-weight: 500; color: #4a5568;">Subtotal</div>
              <div style="font-weight: 600; font-family: 'Courier New', monospace;">${formatCurrency(data.subtotal || 0)}</div>
            </div>
            
            ${data.tax ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dashed #e2e8f0;">
              <div style="font-weight: 500; color: #4a5568;">Tax (${data.tax_rate || 18}%)</div>
              <div style="font-weight: 600; font-family: 'Courier New', monospace;">${formatCurrency(data.tax || 0)}</div>
            </div>
            ` : ''}
            
            <div style="display: flex; justify-content: space-between; margin-top: 20px; padding-top: 15px; border-top: 2px solid #e2e8f0;">
              <div style="font-size: 18px; font-weight: 700; color: #2d3748;">Total Amount</div>
              <div style="font-size: 20px; font-weight: 800; color: #2b6cb0; font-family: 'Courier New', monospace;">
                ${formatCurrency(data.total_amount || data.total || 0)}
              </div>
            </div>
          </div>
          
          <!-- Order Instructions -->
          <div style="margin-top: 30px; padding: 20px; background-color: #f0f9ff; border-radius: 8px; border: 1px solid #bae6fd;">
            <h3 style="margin: 0 0 15px 0; color: #0369a1; font-size: 16px; font-weight: 600; display: flex; align-items: center;">
              <svg style="margin-right: 8px;" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 7H13V13H11V7ZM11 15H13V17H11V15Z" fill="#0369a1"/>
              </svg>
              Important Information for Supplier
            </h3>
            <ul style="margin: 0; padding-left: 20px; color: #0369a1;">
              <li style="margin-bottom: 8px; font-size: 14px; line-height: 1.5;">
                <strong>Order Confirmation:</strong> Please confirm receipt of this purchase order within 24 hours.
              </li>
              <li style="margin-bottom: 8px; font-size: 14px; line-height: 1.5;">
                <strong>Delivery Date:</strong> Kindly ensure delivery is made on or before ${formatDate(deliveryDate)}.
              </li>
              <li style="margin-bottom: 8px; font-size: 14px; line-height: 1.5;">
                <strong>Packing Slip:</strong> Include a detailed packing slip with each shipment.
              </li>
              <li style="margin-bottom: 8px; font-size: 14px; line-height: 1.5;">
                <strong>Invoices:</strong> Send all invoices to ${GMAIL_USER}
              </li>
              ${data.payment_terms === 'prepaid' ? `
              <li style="margin-bottom: 8px; font-size: 14px; line-height: 1.5; color: #b45309; font-weight: 500;">
                <strong>Prepayment Required:</strong> This order requires 100% prepayment. We will process the payment upon receipt of your proforma invoice.
              </li>
              ` : ''}
            </ul>
          </div>
          
          <!-- Contact Information -->
          <div style="margin-top: 30px; text-align: center; color: #4a5568; font-size: 14px; line-height: 1.6;">
            <p style="margin: 0 0 10px 0;">
              <strong>Questions about this order?</strong> Please contact our Purchasing Department at ${COMPANY_PHONE} or reply to this email.
            </p>
            <p style="margin: 0; font-size: 13px; color: #718096;">
              This is an automated message. Please do not reply directly to this email.
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #1a202c; padding: 25px 30px; text-align: center; color: #a0aec0; font-size: 12px; line-height: 1.6;">
          <p style="margin: 0 0 10px 0;">
            &copy; ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.
          </p>
          <p style="margin: 0; font-size: 11px; opacity: 0.8;">
            ${COMPANY_ADDRESS} | ${COMPANY_PHONE} | ${GMAIL_USER}
          </p>
        </div>
      </div>
    </body>
    </html>
    `;
    return this.sendEmail(to, subject, content);
  }

  // Supplier Update Notification
  async sendSupplierUpdate(to, data) {
    const subject = 'Your Supplier Account Has Been Updated';
    const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Supplier Account Update</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">ACCOUNT UPDATED</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">${COMPANY_NAME} Supplier Portal</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          <p style="margin: 0 0 20px 0; color: #666; line-height: 1.6;">Dear ${data.contact_name || 'Valued Supplier'},</p>
          <p style="margin: 0 0 20px 0; color: #666; line-height: 1.6;">This is to inform you that your supplier account information has been updated. Here are the details of the changes:</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #17a2b8;">
            <h3 style="margin: 0 0 15px 0; color: #0c5460; font-size: 18px;">Updated Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              ${data.updated_fields && data.updated_fields.length > 0 ? data.updated_fields.map(field => `
                <tr>
                  <td style="padding: 8px 0; color: #666; width: 120px; vertical-align: top;"><strong>${field.label}:</strong></td>
                  <td style="padding: 8px 0; color: #333;">
                    ${field.old_value ? `
                      <div style="margin-bottom: 5px; padding: 5px; background-color: #fff8e1; border-left: 3px solid #ffc107;">
                        <span style="text-decoration: line-through; color: #dc3545;">${field.old_value}</span>
                      </div>
                      <div style="padding: 5px; background-color: #e8f5e9; border-left: 3px solid #28a745;">
                        <strong>${field.new_value}</strong>
                      </div>
                    ` : `
                      <div style="padding: 5px; background-color: #e8f5e9; border-left: 3px solid #28a745; display: inline-block;">
                        <strong>${field.new_value}</strong>
                      </div>
                    `}
                  </td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="2" style="padding: 8px 0; color: #666; text-align: center;">No specific changes were made to your account details.</td>
                </tr>
              `}
            </table>
          </div>
          
          <p style="margin: 0 0 20px 0; color: #666; line-height: 1.6;">If you did not request these changes or believe this was done in error, please contact our support team immediately at <a href="mailto:${ADMIN_EMAIL}" style="color: #17a2b8; text-decoration: none;">${ADMIN_EMAIL}</a>.</p>
          
          <p style="margin: 0; color: #666; line-height: 1.6;">Thank you for your continued partnership with ${COMPANY_NAME}.</p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="margin: 0; color: #666; font-size: 14px;">${COMPANY_NAME} | Supplier Relations</p>
          <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
    `;
    return this.sendEmail(to, subject, content);
  }

  // Payment Notification
  async sendPaymentNotification(to, data) {
    const subject = `Payment Processed - Invoice #${data.invoice_number}`;
    const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Processed - Invoice #${data.invoice_number}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">PAYMENT CONFIRMATION</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Invoice #${data.invoice_number}</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          <p style="margin: 0 0 20px 0; color: #666; line-height: 1.6;">Dear ${data.recipient_name || 'Valued Customer'},</p>
          <p style="margin: 0 0 20px 0; color: #666; line-height: 1.6;">We are pleased to inform you that we have received your payment. Thank you for your business!</p>
          
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #28a745;">
            <h3 style="margin: 0 0 15px 0; color: #155724; font-size: 20px;">Payment Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 120px;"><strong>Invoice #:</strong></td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${data.invoice_number}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Amount Paid:</strong></td>
                <td style="padding: 8px 0; color: #28a745; font-weight: bold; font-size: 18px;">${data.amount_paid.toLocaleString()} RWF</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Payment Date:</strong></td>
                <td style="padding: 8px 0; color: #333;">${new Date(data.payment_date).toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Payment Method:</strong></td>
                <td style="padding: 8px 0; color: #333; text-transform: capitalize;">${data.payment_method || 'N/A'}</td>
              </tr>
              ${data.transaction_id ? `
              <tr>
                <td style="padding: 8px 0; color: #666; vertical-align: top;"><strong>Transaction ID:</strong></td>
                <td style="padding: 8px 0; color: #333; font-family: monospace; word-break: break-all;">${data.transaction_id}</td>
              </tr>
              ` : ''}
              ${data.payment_notes ? `
              <tr>
                <td style="padding: 8px 0; color: #666; vertical-align: top;"><strong>Notes:</strong></td>
                <td style="padding: 8px 0; color: #333;">${data.payment_notes}</td>
              </tr>
              ` : ''}
            </table>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">Invoice Summary</h3>
            <p style="margin: 0 0 10px 0; color: #666;"><strong>Invoice Date:</strong> ${new Date(data.invoice_date).toLocaleDateString()}</p>
            <p style="margin: 0 0 10px 0; color: #666;"><strong>Due Date:</strong> ${new Date(data.due_date).toLocaleDateString()}</p>
            <p style="margin: 0 0 10px 0; color: #666;"><strong>Invoice Total:</strong> ${data.invoice_total.toLocaleString()} RWF</p>
            <p style="margin: 0; color: #666;"><strong>Amount Paid:</strong> ${data.amount_paid.toLocaleString()} RWF</p>
            ${data.balance_due > 0 ? `
              <p style="margin: 10px 0 0 0; color: #dc3545; font-weight: bold;">
                Balance Due: ${data.balance_due.toLocaleString()} RWF
              </p>
            ` : `
              <p style="margin: 10px 0 0 0; color: #28a745; font-weight: bold;">
                Payment Complete - Thank You!
              </p>
            `}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CUSTOMER_PORTAL_URL || 'https://customers.smartmarket.rw/invoices'}" 
               style="display: inline-block; background-color: #28a745; color: white; text-decoration: none; padding: 12px 25px; border-radius: 4px; font-weight: bold; font-size: 16px;">
              View Invoice
            </a>
          </div>
          
          <p style="margin: 0; color: #666; line-height: 1.6;">If you have any questions about this payment, please contact our billing department at <a href="mailto:billing@smartmarket.rw" style="color: #28a745; text-decoration: none;">billing@smartmarket.rw</a>.</p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="margin: 0; color: #666; font-size: 14px;">${COMPANY_NAME} | Billing Department</p>
          <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
        </div>
              ${data.payment_terms === 'prepaid' ? `
              <li style="margin-bottom: 8px; font-size: 14px; line-height: 1.5; color: #b45309; font-weight: 500;">
                <strong>Prepayment Required:</strong> This order requires 100% prepayment. We will process the payment upon receipt of your proforma invoice.
              </li>
              ` : ''}
            </ul>
          </div>
          
          <!-- Contact Information -->
          <div style="margin-top: 30px; text-align: center; color: #4a5568; font-size: 14px; line-height: 1.6;">
            <p style="margin: 0 0 10px 0;">
              <strong>Questions about this order?</strong> Please contact our Purchasing Department at ${COMPANY_PHONE} or reply to this email.
            </p>
            <p style="margin: 0; font-size: 13px; color: #718096;">
              This is an automated message. Please do not reply directly to this email.
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #1a202c; padding: 25px 30px; text-align: center; color: #a0aec0; font-size: 12px; line-height: 1.6;">
          <p style="margin: 0 0 10px 0;">
            &copy; ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.
          </p>
          <p style="margin: 0; font-size: 11px; opacity: 0.8;">
            ${COMPANY_ADDRESS} | ${COMPANY_PHONE} | ${GMAIL_USER}
          </p>
        </div>
      </div>
    </body>
    </html>
    `;
    return this.sendEmail(to, subject, content);
  }

  // Supplier Update Notification
  async sendSupplierUpdate(to, data) {
    const subject = 'Your Supplier Account Has Been Updated';
    const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Supplier Account Update</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">ACCOUNT UPDATED</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">${COMPANY_NAME} Supplier Portal</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          <p style="margin: 0 0 20px 0; color: #666; line-height: 1.6;">Dear ${data.contact_name || 'Valued Supplier'},</p>
          <p style="margin: 0 0 20px 0; color: #666; line-height: 1.6;">This is to inform you that your supplier account information has been updated. Here are the details of the changes:</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #17a2b8;">
            <h3 style="margin: 0 0 15px 0; color: #0c5460; font-size: 18px;">Updated Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              ${data.updated_fields && data.updated_fields.length > 0 ? data.updated_fields.map(field => `
                <tr>
                  <td style="padding: 8px 0; color: #666; width: 120px; vertical-align: top;"><strong>${field.label}:</strong></td>
                  <td style="padding: 8px 0; color: #333;">
                    ${field.old_value ? `
                      <div style="margin-bottom: 5px; padding: 5px; background-color: #fff8e1; border-left: 3px solid #ffc107;">
                        <span style="text-decoration: line-through; color: #dc3545;">${field.old_value}</span>
                      </div>
                      <div style="padding: 5px; background-color: #e8f5e9; border-left: 3px solid #28a745;">
                        <strong>${field.new_value}</strong>
                      </div>
                    ` : `
                      <div style="padding: 5px; background-color: #e8f5e9; border-left: 3px solid #28a745; display: inline-block;">
                        <strong>${field.new_value}</strong>
                      </div>
                    `}
                  </td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="2" style="padding: 8px 0; color: #666; text-align: center;">No specific changes were made to your account details.</td>
                </tr>
              `}
            </table>
          </div>
          
          <p style="margin: 0 0 20px 0; color: #666; line-height: 1.6;">If you did not request these changes or believe this was done in error, please contact our support team immediately at <a href="mailto:${ADMIN_EMAIL}" style="color: #17a2b8; text-decoration: none;">${ADMIN_EMAIL}</a>.</p>
          
          <p style="margin: 0; color: #666; line-height: 1.6;">Thank you for your continued partnership with ${COMPANY_NAME}.</p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="margin: 0; color: #666; font-size: 14px;">${COMPANY_NAME} | Supplier Relations</p>
          <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
    `;
    return this.sendEmail(to, subject, content);
  }

  // Payment Notification
  async sendPaymentNotification(to, data) {
    const subject = `Payment Processed - Invoice #${data.invoice_number}`;
    const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Processed - Invoice #${data.invoice_number}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">PAYMENT CONFIRMATION</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Invoice #${data.invoice_number}</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          <p style="margin: 0 0 20px 0; color: #666; line-height: 1.6;">Dear ${data.recipient_name || 'Valued Customer'},</p>
          <p style="margin: 0 0 20px 0; color: #666; line-height: 1.6;">We are pleased to inform you that we have received your payment. Thank you for your business!</p>
          
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #28a745;">
            <h3 style="margin: 0 0 15px 0; color: #155724; font-size: 20px;">Payment Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 120px;"><strong>Invoice #:</strong></td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${data.invoice_number}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Amount Paid:</strong></td>
                <td style="padding: 8px 0; color: #28a745; font-weight: bold; font-size: 18px;">${data.amount_paid.toLocaleString()} RWF</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Payment Date:</strong></td>
                <td style="padding: 8px 0; color: #333;">${new Date(data.payment_date).toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Payment Method:</strong></td>
                <td style="padding: 8px 0; color: #333; text-transform: capitalize;">${data.payment_method || 'N/A'}</td>
              </tr>
              ${data.transaction_id ? `
              <tr>
                <td style="padding: 8px 0; color: #666; vertical-align: top;"><strong>Transaction ID:</strong></td>
                <td style="padding: 8px 0; color: #333; font-family: monospace; word-break: break-all;">${data.transaction_id}</td>
              </tr>
              ` : ''}
              ${data.payment_notes ? `
              <tr>
                <td style="padding: 8px 0; color: #666; vertical-align: top;"><strong>Notes:</strong></td>
                <td style="padding: 8px 0; color: #333;">${data.payment_notes}</td>
              </tr>
              ` : ''}
            </table>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">Invoice Summary</h3>
            <p style="margin: 0 0 10px 0; color: #666;"><strong>Invoice Date:</strong> ${new Date(data.invoice_date).toLocaleDateString()}</p>
            <p style="margin: 0 0 10px 0; color: #666;"><strong>Due Date:</strong> ${new Date(data.due_date).toLocaleDateString()}</p>
            <p style="margin: 0 0 10px 0; color: #666;"><strong>Invoice Total:</strong> ${data.invoice_total.toLocaleString()} RWF</p>
            <p style="margin: 0; color: #666;"><strong>Amount Paid:</strong> ${data.amount_paid.toLocaleString()} RWF</p>
            ${data.balance_due > 0 ? `
              <p style="margin: 10px 0 0 0; color: #dc3545; font-weight: bold;">
                Balance Due: ${data.balance_due.toLocaleString()} RWF
              </p>
            ` : `
              <p style="margin: 10px 0 0 0; color: #28a745; font-weight: bold;">
                Payment Complete - Thank You!
              </p>
            `}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CUSTOMER_PORTAL_URL || 'https://customers.smartmarket.rw/invoices'}" 
               style="display: inline-block; background-color: #28a745; color: white; text-decoration: none; padding: 12px 25px; border-radius: 4px; font-weight: bold; font-size: 16px;">
              View Invoice
            </a>
          </div>
          
          <p style="margin: 0; color: #666; line-height: 1.6;">If you have any questions about this payment, please contact our billing department at <a href="mailto:billing@smartmarket.rw" style="color: #28a745; text-decoration: none;">billing@smartmarket.rw</a>.</p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="margin: 0; color: #666; font-size: 14px;">${COMPANY_NAME} | Billing Department</p>
          <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
    `;
    return this.sendEmail(to, subject, content);
  }

  async sendOrderConfirmation(to, orderData) {
    const subject = `Order Confirmation #${orderData.order_id}`;
    const itemsHtml = orderData.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${parseInt(item.price).toLocaleString()} RWF</td>
      </tr>
    `).join('');

    const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 30px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">Order Confirmed!</h1>
          <p style="color: #666; margin-top: 10px;">Thank you for your purchase, ${orderData.customer_name}</p>
        </div>

        <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
          <h2 style="font-size: 18px; margin-top: 0; color: #1e293b;">Order Details</h2>
          <p style="margin: 5px 0;"><strong>Order ID:</strong> ${orderData.order_id}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(orderData.order_date).toLocaleDateString()}</p>
          <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${orderData.payment_method.toUpperCase()}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0;">Item</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e2e8f0;">Qty</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e2e8f0;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold;">Total:</td>
              <td style="padding: 12px; text-align: right; font-weight: bold; color: #2563eb;">${parseInt(orderData.total_amount).toLocaleString()} RWF</td>
            </tr>
          </tfoot>
        </table>

        <div style="text-align: center; color: #666; font-size: 14px; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
          <p>If you have any questions, please contact our support team.</p>
          <p>&copy; ${new Date().getFullYear()} ${process.env.COMPANY_NAME || 'Top Design'}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;
    return this.sendEmail(to, subject, content);
  }
}

export default new EmailService();