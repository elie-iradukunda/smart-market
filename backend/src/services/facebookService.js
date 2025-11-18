import axios from 'axios';

class FacebookService {
  constructor() {
    this.baseURL = 'https://graph.facebook.com/v18.0';
    this.accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    this.pageId = process.env.FACEBOOK_PAGE_ID;
  }

  async createCampaign(campaignData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/act_${process.env.FACEBOOK_AD_ACCOUNT_ID}/campaigns`,
        {
          name: campaignData.name,
          objective: 'CONVERSIONS',
          status: 'ACTIVE',
          access_token: this.accessToken
        }
      );
      return response.data;
    } catch (error) {
      throw new Error('Facebook campaign creation failed');
    }
  }

  async getCampaignInsights(campaignId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/${campaignId}/insights`,
        {
          params: {
            fields: 'impressions,clicks,conversions,spend',
            access_token: this.accessToken
          }
        }
      );
      return response.data;
    } catch (error) {
      throw new Error('Facebook insights fetch failed');
    }
  }

  async sendMessage(recipientId, message) {
    try {
      const response = await axios.post(
        `${this.baseURL}/${this.pageId}/messages`,
        {
          recipient: { id: recipientId },
          message: { text: message },
          access_token: this.accessToken
        }
      );
      return response.data;
    } catch (error) {
      throw new Error('Facebook message sending failed');
    }
  }
}

export default new FacebookService();