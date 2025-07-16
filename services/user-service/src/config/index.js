const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { logWithMeta } = require('@gauravsharmacode/neat-logger');

const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  serviceName: process.env.SERVICE_NAME || 'user-service',
  
  database: {
    url: process.env.DATABASE_URL,
    logQueries: process.env.DB_LOG_QUERIES === 'true',
    logSlowQueries: process.env.DB_LOG_SLOW_QUERIES === 'true',
    slowQueryThreshold: parseInt(process.env.DB_SLOW_QUERY_THRESHOLD) || 1000
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-change-this',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json'
  },
  
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12
  },
  
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test'
};

// Validate required config (skip in test environment)
if (!config.database.url && process.env.NODE_ENV !== 'test') {
  logWithMeta('DATABASE_URL is required', { level: 'error' });
  process.exit(1);
}

module.exports = config;
