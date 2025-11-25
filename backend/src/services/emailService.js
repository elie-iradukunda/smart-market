import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
  }

  async sendEmail(to, subject, content, from = process.env.GMAIL_USER) {
    try {
      const mailOptions = {
        from: from,
        to: to,
        subject: subject,
        html: content
      };
      
      const result = await this.transporter.sendMail(mailOptions);
      return result;
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Email sending failed');
    }
  }

  async sendInvoice(customerEmail, invoiceData) {
    const subject = `Invoice #${invoiceData.id} - Smart Market`;
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
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">SMART MARKET</h1>
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
            <h4 style="margin: 0 0 10px 0; color: #333;">💳 Payment Instructions</h4>
            <p style="margin: 0; color: #666; line-height: 1.5;">Please make payment by the due date. You can pay via cash, check, or bank transfer. Contact us for payment details.</p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
          <h3 style="margin: 0 0 15px 0; color: #333;">Thank you for your business! 🙏</h3>
          <p style="margin: 0 0 10px 0; color: #666;">Smart Market - Your trusted printing partner</p>
          <div style="margin-top: 20px;">
            <p style="margin: 0; color: #999; font-size: 12px;">📧 smartmarket399@gmail.com | 📞 Contact us for support</p>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
    return this.sendEmail(customerEmail, subject, content);
  }

  async sendPaymentConfirmation(customerEmail, paymentData) {
    const subject = `Payment Confirmation - Invoice #${paymentData.invoice_id} - Smart Market`;
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
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">SMART MARKET</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Payment Confirmation</p>
        </div>
        
        <!-- Payment Details -->
        <div style="padding: 30px;">
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin-bottom: 30px;">
            <h2 style="margin: 0 0 15px 0; color: #28a745; font-size: 24px;">✅ Payment Received</h2>
            <p style="margin: 0; color: #666; font-size: 16px;">Thank you! Your payment has been successfully processed.</p>
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
              <span style="color: #333;">${paymentData.method.toUpperCase()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #666;">Status:</span>
              <span style="color: ${paymentData.status === 'paid' ? '#28a745' : '#ffc107'}; font-weight: bold;">${paymentData.status.toUpperCase()}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #666;">Date:</span>
              <span style="color: #333;">${new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
          <h3 style="margin: 0 0 15px 0; color: #333;">Thank you for your payment! 🙏</h3>
          <p style="margin: 0 0 10px 0; color: #666;">Smart Market - Your trusted printing partner</p>
          <div style="margin-top: 20px;">
            <p style="margin: 0; color: #999; font-size: 12px;">📧 smartmarket399@gmail.com | 📞 Contact us for support</p>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
    return this.sendEmail(customerEmail, subject, content);
  }

  async sendQuote(customerEmail, quoteData) {
    const subject = `Quote #${quoteData.quote_id} - Smart Market`;
    const itemsHtml = quoteData.items.map(item => 
      `<tr><td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.description}</td><td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td><td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${item.unit_price.toLocaleString()} RWF</td><td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${(item.unit_price * item.quantity).toLocaleString()} RWF</td></tr>`
    ).join('');
    
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
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">SMART MARKET</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Professional Printing Services</p>
        </div>
        
        <div style="padding: 30px;">
          <h2 style="margin: 0 0 20px 0; color: #333;">Quote #${quoteData.quote_id}</h2>
          <p style="margin: 0 0 20px 0; color: #666;">Dear ${quoteData.customer_name},</p>
          <p style="margin: 0 0 20px 0; color: #666;">Thank you for your interest in our printing services. Please find your quote details below:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #28a745;">Description</th>
                <th style="padding: 12px 8px; text-align: center; border-bottom: 2px solid #28a745;">Qty</th>
                <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #28a745;">Unit Price</th>
                <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #28a745;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div style="text-align: right; margin-top: 20px;">
            <h3 style="margin: 0; color: #28a745; font-size: 20px;">Total: ${quoteData.total_amount.toLocaleString()} RWF</h3>
          </div>
          
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin-top: 30px;">
            <p style="margin: 0; color: #666;">This quote is valid for 30 days. Please contact us to proceed with your order.</p>
          </div>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
          <h3 style="margin: 0 0 15px 0; color: #333;">Ready to proceed? 📞</h3>
          <p style="margin: 0 0 10px 0; color: #666;">Contact us to confirm your order</p>
          <p style="margin: 0; color: #999; font-size: 12px;">📧 smartmarket399@gmail.com</p>
        </div>
      </div>
    </body>
    </html>
    `;
    return this.sendEmail(customerEmail, subject, content);
  }

  async sendQuoteApproval(customerEmail, approvalData) {
    const subject = `Quote Approved - Order Confirmed #${approvalData.quote_id} - Smart Market`;
    const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Quote Approved</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">SMART MARKET</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Order Confirmation</p>
        </div>
        
        <div style="padding: 30px;">
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin-bottom: 30px;">
            <h2 style="margin: 0 0 15px 0; color: #28a745; font-size: 24px;">🎉 Quote Approved!</h2>
            <p style="margin: 0; color: #666; font-size: 16px;">Your quote has been approved and your order is now in production.</p>
          </div>
          
          <h3 style="margin: 0 0 15px 0; color: #333;">Order Details</h3>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #666;">Quote #:</span>
              <span style="color: #333; font-weight: bold;">${approvalData.quote_id}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #666;">Customer:</span>
              <span style="color: #333;">${approvalData.customer_name}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #666;">Total Amount:</span>
              <span style="color: #28a745; font-weight: bold;">${approvalData.total_amount.toLocaleString()} RWF</span>
            </div>
          </div>
          
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #ffc107;">
            <h4 style="margin: 0 0 10px 0; color: #856404;">📋 Next Steps</h4>
            <p style="margin: 0; color: #856404; line-height: 1.5;">Your order is now in the design phase. We'll keep you updated on the progress and notify you when it's ready for pickup/delivery.</p>
          </div>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
          <h3 style="margin: 0 0 15px 0; color: #333;">Thank you for choosing Smart Market! 🙏</h3>
          <p style="margin: 0 0 10px 0; color: #666;">We'll deliver quality printing services</p>
          <p style="margin: 0; color: #999; font-size: 12px;">📧 smartmarket399@gmail.com</p>
        </div>
      </div>
    </body>
    </html>
    `;
    return this.sendEmail(customerEmail, subject, content);
  }

  async sendOrderNotification(adminEmail, orderData) {
    const subject = `New Order Alert - Quote #${orderData.quote_id} Approved`;
    const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order Alert</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🚨 NEW ORDER ALERT</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Smart Market Admin Dashboard</p>
        </div>
        
        <div style="padding: 30px;">
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 30px;">
            <h2 style="margin: 0 0 15px 0; color: #856404; font-size: 24px;">📋 New Order Received</h2>
            <p style="margin: 0; color: #856404; font-size: 16px;">A quote has been approved and converted to an order.</p>
          </div>
          
          <h3 style="margin: 0 0 15px 0; color: #333;">Order Details</h3>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #666;">Quote ID:</span>
              <span style="color: #333; font-weight: bold;">#${orderData.quote_id}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #666;">Customer:</span>
              <span style="color: #333;">${orderData.customer_name}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #666;">Order Value:</span>
              <span style="color: #28a745; font-weight: bold;">${orderData.total_amount.toLocaleString()} RWF</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #666;">Status:</span>
              <span style="color: #17a2b8; font-weight: bold;">DESIGN PHASE</span>
            </div>
          </div>
          
          <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #17a2b8;">
            <h4 style="margin: 0 0 10px 0; color: #0c5460;">⚡ Action Required</h4>
            <p style="margin: 0; color: #0c5460; line-height: 1.5;">Please assign this order to the design team and update the production schedule.</p>
          </div>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
          <h3 style="margin: 0 0 15px 0; color: #333;">Smart Market Admin Panel 🎯</h3>
          <p style="margin: 0; color: #999; font-size: 12px;">This is an automated notification from Smart Market system</p>
        </div>
      </div>
    </body>
    </html>
    `;
    return this.sendEmail(adminEmail, subject, content);
  }

  async sendWorkOrderAssignment(technicianEmail, workOrderData) {
    const subject = `Work Order Assignment - Order #${workOrderData.order_id} - Smart Market`;
    const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Work Order Assignment</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #17a2b8 0%, #20c997 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🔧 WORK ORDER ASSIGNED</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Smart Market Production</p>
        </div>
        
        <div style="padding: 30px;">
          <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; border-left: 4px solid #17a2b8; margin-bottom: 30px;">
            <h2 style="margin: 0 0 15px 0; color: #0c5460; font-size: 24px;">🎯 New Assignment</h2>
            <p style="margin: 0; color: #0c5460; font-size: 16px;">You have been assigned a new work order for production.</p>
          </div>
          
          <h3 style="margin: 0 0 15px 0; color: #333;">Work Order Details</h3>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #666;">Work Order ID:</span>
              <span style="color: #333; font-weight: bold;">#${workOrderData.work_order_id}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #666;">Order ID:</span>
              <span style="color: #333; font-weight: bold;">#${workOrderData.order_id}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #666;">Customer:</span>
              <span style="color: #333;">${workOrderData.customer_name}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #666;">Stage:</span>
              <span style="color: #17a2b8; font-weight: bold;">${workOrderData.stage.toUpperCase()}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #666;">Assigned To:</span>
              <span style="color: #333;">${workOrderData.technician_name}</span>
            </div>
          </div>
          
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #ffc107;">
            <h4 style="margin: 0 0 10px 0; color: #856404;">⚡ Action Required</h4>
            <p style="margin: 0; color: #856404; line-height: 1.5;">Please start working on this order and update the system with your progress. Log your time and materials used.</p>
          </div>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
          <h3 style="margin: 0 0 15px 0; color: #333;">Let's get to work! 💪</h3>
          <p style="margin: 0 0 10px 0; color: #666;">Smart Market Production Team</p>
          <p style="margin: 0; color: #999; font-size: 12px;">📧 smartmarket399@gmail.com</p>
        </div>
      </div>
    </body>
    </html>
    `;
    return this.sendEmail(technicianEmail, subject, content);
  }

  async sendOrderStatusUpdate(customerEmail, statusData) {
    const subject = `Order Update - Order #${statusData.order_id} is ${statusData.status.toUpperCase()} - Smart Market`;
    const statusMessages = {
      ready: { title: '🎉 Order Ready for Pickup!', message: 'Great news! Your order is ready for pickup.', color: '#28a745' },
      delivered: { title: '🚚 Order Delivered!', message: 'Your order has been successfully delivered.', color: '#17a2b8' }
    };
    
    const statusInfo = statusMessages[statusData.status] || { title: 'Order Updated', message: 'Your order status has been updated.', color: '#6c757d' };
    
    const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Status Update</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, ${statusInfo.color} 0%, #20c997 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">SMART MARKET</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Order Status Update</p>
        </div>
        
        <div style="padding: 30px;">
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid ${statusInfo.color}; margin-bottom: 30px;">
            <h2 style="margin: 0 0 15px 0; color: ${statusInfo.color}; font-size: 24px;">${statusInfo.title}</h2>
            <p style="margin: 0; color: #666; font-size: 16px;">${statusInfo.message}</p>
          </div>
          
          <h3 style="margin: 0 0 15px 0; color: #333;">Order Details</h3>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #666;">Order ID:</span>
              <span style="color: #333; font-weight: bold;">#${statusData.order_id}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #666;">Customer:</span>
              <span style="color: #333;">${statusData.customer_name}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #666;">Status:</span>
              <span style="color: ${statusInfo.color}; font-weight: bold;">${statusData.status.toUpperCase()}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #666;">Updated:</span>
              <span style="color: #333;">${new Date().toLocaleDateString()}</span>
            </div>
          </div>
          
          ${statusData.status === 'ready' ? `
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #ffc107;">
            <h4 style="margin: 0 0 10px 0; color: #856404;">📋 Next Steps</h4>
            <p style="margin: 0; color: #856404; line-height: 1.5;">Please visit our location to pick up your order. Contact us if you need to arrange delivery.</p>
          </div>
          ` : ''}
        </div>
        
        <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
          <h3 style="margin: 0 0 15px 0; color: #333;">Thank you for choosing Smart Market! 🙏</h3>
          <p style="margin: 0 0 10px 0; color: #666;">Quality printing services delivered</p>
          <p style="margin: 0; color: #999; font-size: 12px;">📧 smartmarket399@gmail.com</p>
        </div>
      </div>
    </body>
    </html>
    `;
    return this.sendEmail(customerEmail, subject, content);
  }
}

export default new EmailService();