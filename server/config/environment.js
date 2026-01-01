/**
 * Environment Configuration Helper
 * Centralizes all environment variable access and provides defaults
 */

require('dotenv').config();

const config = {
  // Server Configuration
  server: {
    port: process.env.PORT || 5002,
    host: process.env.HOST || 'localhost',
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  // Database Configuration
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/marketplace',
    name: process.env.DB_NAME || 'marketplace',
  },

  // Authentication Configuration
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'fallback_secret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT) || 24,
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
  },

  // Client Configuration
  client: {
    url: process.env.CLIENT_URL || 'http://localhost:3000',
    port: parseInt(process.env.CLIENT_PORT) || 3000,
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  // Email Configuration
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || 'noreply@marketplace.com',
    fromName: process.env.EMAIL_FROM_NAME || 'Marketplace',
    enableNotifications: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
    enableOrderEmails: process.env.ENABLE_ORDER_EMAILS === 'true',
    enableMarketingEmails: process.env.ENABLE_MARKETING_EMAILS === 'true',
  },

  // Payment Configuration
  payment: {
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    },
    paypal: {
      clientId: process.env.PAYPAL_CLIENT_ID,
      clientSecret: process.env.PAYPAL_CLIENT_SECRET,
      mode: process.env.PAYPAL_MODE || 'sandbox',
    },
    enableCOD: process.env.ENABLE_COD === 'true',
    taxRate: parseFloat(process.env.TAX_RATE) || 10,
    currency: process.env.CURRENCY || 'USD',
  },

  // Shipping Configuration
  shipping: {
    freeShippingThreshold: parseFloat(process.env.FREE_SHIPPING_THRESHOLD) || 50,
    standardShippingCost: parseFloat(process.env.STANDARD_SHIPPING_COST) || 5.99,
    expressShippingCost: parseFloat(process.env.EXPRESS_SHIPPING_COST) || 12.99,
    internationalShipping: process.env.INTERNATIONAL_SHIPPING === 'true',
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880,
    uploadPath: process.env.UPLOAD_PATH || 'uploads',
    allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || ['jpg', 'jpeg', 'png', 'gif', 'pdf'],
    maxFilesPerUpload: parseInt(process.env.MAX_FILES_PER_UPLOAD) || 5,
  },

  // Admin Configuration
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@marketplace.com',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    name: process.env.ADMIN_NAME || 'Admin User',
  },

  // Notification Configuration
  notifications: {
    socketPort: parseInt(process.env.SOCKET_PORT) || 5002,
    enableRealTime: process.env.ENABLE_REAL_TIME_NOTIFICATIONS === 'true',
    enablePush: process.env.ENABLE_PUSH_NOTIFICATIONS === 'true',
    vapidPublicKey: process.env.VAPID_PUBLIC_KEY,
    vapidPrivateKey: process.env.VAPID_PRIVATE_KEY,
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING === 'true',
  },

  // Development Configuration
  development: {
    enableDebugMode: process.env.ENABLE_DEBUG_MODE === 'true',
    enableSeedData: process.env.ENABLE_SEED_DATA === 'true',
    enableTestRoutes: process.env.ENABLE_TEST_ROUTES === 'true',
  },

  // API Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },

  // API Endpoints
  endpoints: {
    auth: {
      login: process.env.AUTH_LOGIN_ENDPOINT || '/api/auth/login',
      register: process.env.AUTH_REGISTER_ENDPOINT || '/api/auth/register',
      me: process.env.AUTH_ME_ENDPOINT || '/api/auth/me',
      profile: process.env.AUTH_PROFILE_ENDPOINT || '/api/auth/profile',
    },
    products: {
      base: process.env.PRODUCTS_ENDPOINT || '/api/products',
      test: process.env.PRODUCTS_TEST_ENDPOINT || '/api/products/test',
      compare: process.env.PRODUCTS_COMPARE_ENDPOINT || '/api/products/compare',
    },
    orders: {
      base: process.env.ORDERS_ENDPOINT || '/api/orders',
      myOrders: process.env.ORDERS_MY_ORDERS_ENDPOINT || '/api/orders/my-orders',
      track: process.env.ORDERS_TRACK_ENDPOINT || '/api/orders/{id}/track',
      return: process.env.ORDERS_RETURN_ENDPOINT || '/api/orders/{id}/return',
    },
    admin: {
      stats: process.env.ADMIN_STATS_ENDPOINT || '/api/admin/stats',
      users: process.env.ADMIN_USERS_ENDPOINT || '/api/admin/users',
      orders: process.env.ADMIN_ORDERS_ENDPOINT || '/api/admin/orders',
      products: process.env.ADMIN_PRODUCTS_ENDPOINT || '/api/admin/products',
      analytics: process.env.ADMIN_ANALYTICS_ENDPOINT || '/api/admin/analytics',
      settings: process.env.ADMIN_SETTINGS_ENDPOINT || '/api/admin/settings',
    },
    health: process.env.HEALTH_ENDPOINT || '/api/health',
  },
};

// Validation function
const validateConfig = () => {
  const required = [
    'MONGODB_URI',
    'JWT_SECRET',
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.error('Please check your .env file and ensure all required variables are set.');
    process.exit(1);
  }
};

// Export configuration
module.exports = {
  ...config,
  validateConfig,
  isDevelopment: config.server.nodeEnv === 'development',
  isProduction: config.server.nodeEnv === 'production',
  isTest: config.server.nodeEnv === 'test',
};