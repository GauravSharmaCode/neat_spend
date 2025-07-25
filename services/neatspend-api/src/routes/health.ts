import { Router, Request, Response } from 'express';
import { HealthResponse } from '../interfaces';
import config from '../config';
import { checkServiceHealth } from '../core/utils/health';

// Using require for neat-logger since it doesn't have proper ES modules support
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { logWithMeta } = require("@gauravsharmacode/neat-logger");

const router = Router();

// Root endpoint with service info
router.get('/', (req: Request, res: Response) => {
  logWithMeta('Root endpoint hit', { func: '/', level: 'info' });
  res.status(200).json({
    status: 'success',
    message: 'NeatSpend API Gateway is running!',
    version: '1.0.0',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
    services: {
      'user-service': config.services.userService,
      'api-gateway': `http://localhost:${config.port}`,
    },
  });
});

// Health check endpoint with service connectivity
router.get('/health', async (req: Request, res: Response) => {
  logWithMeta('Health check endpoint hit', { func: '/health', level: 'info' });

  const healthStatus: HealthResponse = {
    status: 'success',
    message: 'API Gateway is healthy',
    service: 'neatspend-api',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    services: {},
  };

  // Check user service health
  const userHealthCheck = await checkServiceHealth('user-service', config.services.userService);
  healthStatus.services!['user-service'] = userHealthCheck;
  
  // Add more service health checks as needed
  // Example: const smsHealthCheck = await checkServiceHealth('sms-service', config.services.smsService);
  // healthStatus.services!['sms-service'] = smsHealthCheck;

  const statusCode = healthStatus.status === 'success' ? 200 : 503;
  res.status(statusCode).json(healthStatus);
});

export default router;