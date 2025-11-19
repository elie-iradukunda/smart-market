import axios from 'axios';

class EmailService {
  constructor() {
    this.apiKey = process.env.SENDGRID_API_KEY;
    this.baseURL = 'https://api.sendgrid.com/v3';
  }

  async sendEmail(to, subject, content, from = process.env.FROM_EMAIL) {
    try {
      const response = await axios.post(
        `${this.baseURL}/mail/send`,
        {
          personalizations: [{
            to: [{ email: to }],
            subject: subject
          }],
          from: { email: from },
          content: [{
            type: 'text/html',
            value: content
          }]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw new Error('Email sending failed');
    }
  }

  async sendInvoice(customerEmail, invoiceData) {
    const subject = `Invoice #${invoiceData.id} - Smart Market`;
    const content = `
      <h2>Invoice #${invoiceData.id}</h2>
      <p>Amount: $${invoiceData.amount}</p>
      <p>Due Date: ${invoiceData.due_date}</p>
      <p>Thank you for your business!</p>
    `;
    return this.sendEmail(customerEmail, subject, content);
  }
}

export default new EmailService();