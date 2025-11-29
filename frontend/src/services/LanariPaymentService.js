// src/services/LanariPaymentService.js
import axios from 'axios'

class LanariPaymentService {
  constructor() {
    this.apiUrl = 'https://www.lanari.rw/lanari_pay/api/payment/process.php'
    this.apiKey = import.meta.env.VITE_LANARI_API_KEY || 'da0209a4e5f3be1b932ba53b5bfc54d66033bd19b3277ef00a8106d4f41f30bf'
    this.apiSecret = import.meta.env.VITE_LANARI_API_SECRET || 'e723b314c53846ac7f3645d1a62398fad5039a25e9f7121fb84d561e0c52567bc5aa2f66cfe48f702485d999924858792c0e262439ff1c3eeedccf57c2790a4f'
  }

  formatPhone(phone) {
    let p = String(phone).trim().replace(/\s+/g, '').replace(/^\+/, '')
    if (p.startsWith('250')) p = '0' + p.slice(3)
    if (!p.startsWith('0') && (p.length === 8 || p.length === 9)) p = '0' + p
    return p
  }

  async processPayment({ amount, customer_phone, currency = 'RWF', description = 'Payment' }) {
    const payload = {
      api_key: this.apiKey,
      api_secret: this.apiSecret,
      amount: Math.round(amount),
      customer_phone: this.formatPhone(customer_phone),
      currency,
      description: description.replace(/[#@]/g, ' '),
    }

    try {
      const { data } = await axios.post(this.apiUrl, payload, { timeout: 180000 })
      const txId = data?.transaction_id || data?.transactionId || data?.reference_id

      return {
        success: true,
        transaction_id: txId || 'pending',
        message: data?.message || 'Request sent to customer',
        raw_response: data,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Payment failed. Please try again.',
      }
    }
  }
}

export default new LanariPaymentService()