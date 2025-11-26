import dotenv from 'dotenv';

dotenv.config();

class Config {
  constructor() {
    this.settings = {
      // Server settings
      PORT: process.env.PORT || 3000,
      NODE_ENV: process.env.NODE_ENV || 'development',
      
      // Database settings
      DB_HOST: process.env.DB_HOST || 'localhost',
      DB_PORT: process.env.DB_PORT || 3306,
      DB_NAME: process.env.DB_NAME || 'smart_market',
      DB_USER: process.env.DB_USER || 'root',
      DB_PASSWORD: process.env.DB_PASSWORD || '',
      
      // JWT settings
      JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
      
      // Frontend settings
      FRONTEND_BASE_URL: process.env.FRONTEND_BASE_URL || 'http://localhost:5173',
      
      // Email settings
      SMTP_HOST: process.env.SMTP_HOST || 'localhost',
      SMTP_PORT: process.env.SMTP_PORT || 587,
      SMTP_USER: process.env.SMTP_USER || '',
      SMTP_PASS: process.env.SMTP_PASS || '',
      
      // Admin settings
      ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@smartmarket.com',
      
      // Rate limiting
      RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || 900000,
      RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS || 100
    };
  }

  get(key) {
    return this.settings[key];
  }

  set(key, value) {
    this.settings[key] = value;
  }

  getBaseUrl(req = null) {
    if (req) {
      return req.get('origin') || 
             req.get('referer')?.split('/').slice(0, 3).join('/') || 
             this.get('FRONTEND_BASE_URL') || 
             `${req.protocol}://${req.get('host')}`;
    }
    return this.get('FRONTEND_BASE_URL');
  }

  isDevelopment() {
    return this.get('NODE_ENV') === 'development';
  }

  isProduction() {
    return this.get('NODE_ENV') === 'production';
  }
}

export default new Config();