import axios from 'axios';

class WhatsAppService {
  constructor() {
    this.baseURL = 'https://graph.facebook.com/v18.0';
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  }

  async sendMessage(to, message) {
    try {
      const response = await axios.post(
        `${this.baseURL}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: { body: message }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw new Error('WhatsApp message sending failed');
    }
  }

  async sendTemplate(to, templateName, parameters = []) {
    try {
      const response = await axios.post(
        `${this.baseURL}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'template',
          template: {
            name: templateName,
            language: { code: 'en' },
            components: parameters.length > 0 ? [{
              type: 'body',
              parameters: parameters.map(param => ({ type: 'text', text: param }))
            }] : []
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw new Error('WhatsApp template sending failed');
    }
  }
}

export default new WhatsAppService();