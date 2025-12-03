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
