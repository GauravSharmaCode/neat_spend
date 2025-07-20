import * as dotenv from 'dotenv';
import type { ApiGatewayConfig } from '../interfaces';

dotenv.config();

const config: ApiGatewayConfig = {
  port: parseInt(process.env.PORT || '8080'),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Service URLs for microservices
  services: {
    userService: process.env.USER_SERVICE_URL || 'http://localhost:3001',
    smsService: process.env.SMS_SERVICE_URL || 'http://localhost:8081',
    insightService: process.env.INSIGHT_SERVICE_URL || 'http://localhost:8082'
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json'
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12')
  },
  
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test'
};

export default config;
