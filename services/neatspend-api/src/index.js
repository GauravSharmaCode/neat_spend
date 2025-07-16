const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const { createProxyMiddleware } = require('http-proxy-middleware');
const { logWithMeta } = require('@gauravsharmacode/neat-logger');
const config = require("./config");

const app = express();

// Security middleware
app.use(helmet());

// CORS middleware
app.use(cors(config.cors));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logWithMeta('HTTP Request', {
      func: 'requestLogger',
      level: 'info',
      extra: {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: duration,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }
    });
  });

  next();
});

// Health check endpoint
app.get("/", (req, res) => {
  logWithMeta("Root endpoint hit", { func: "/", level: 'info' });
  res.status(200).json({
    status: 'success',
    message: 'NeatSpend API Gateway is running!',
    version: '1.0.0',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
    services: {
      'user-service': userServiceUrl,
      'api-gateway': `http://localhost:${config.port}`
    }
  });
});

// Health check endpoint with service connectivity
app.get("/health", async (req, res) => {
  logWithMeta("Health check endpoint hit", { func: "/health", level: 'info' });
  
  const healthStatus = {
    status: 'success',
    message: 'API Gateway is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {}
  };

  // Check user service health
  try {
    const userServiceHealthUrl = `${userServiceUrl}/health`;
    const response = await fetch(userServiceHealthUrl, { 
      timeout: 3000,
      headers: { 'Accept': 'application/json' }
    });
    
    healthStatus.services['user-service'] = {
      url: userServiceUrl,
      status: response.ok ? 'healthy' : 'unhealthy',
      responseTime: response.headers.get('x-response-time') || 'unknown'
    };
  } catch (error) {
    healthStatus.services['user-service'] = {
      url: userServiceUrl,
      status: 'unhealthy',
      error: error.message
    };
    healthStatus.status = 'degraded';
  }

  const statusCode = healthStatus.status === 'success' ? 200 : 503;
  res.status(statusCode).json(healthStatus);
});

// Proxy routes to microservices
const userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service:3001';

// User service proxy with circuit breaker
const userServiceProxy = createProxyMiddleware({
  target: userServiceUrl,
  changeOrigin: true,
  timeout: 10000,
  proxyTimeout: 10000,
  onError: (err, req, res) => {
    logWithMeta('User service proxy error', {
      func: 'proxyError',
      level: 'error',
      extra: {
        error: err.message,
        url: req.url,
        target: userServiceUrl
      }
    });
    
    res.status(503).json({
      status: 'error',
      message: 'User service is currently unavailable',
      code: 'SERVICE_UNAVAILABLE'
    });
  },
  // eslint-disable-next-line no-unused-vars
  onProxyReq: (proxyReq, req, _res) => {
    logWithMeta('Proxying request to user service', {
      func: 'proxyRequest',
      level: 'info',
      extra: {
        method: req.method,
        path: req.path,
        target: userServiceUrl
      }
    });
  },
  // eslint-disable-next-line no-unused-vars
  onProxyRes: (proxyRes, req, _res) => {
    logWithMeta('Received response from user service', {
      func: 'proxyResponse',
      level: 'info',
      extra: {
        statusCode: proxyRes.statusCode,
        method: req.method,
        path: req.path
      }
    });
  }
});

// Route all user-related requests to user service
app.use('/api/v1/auth', userServiceProxy);
app.use('/api/v1/users', userServiceProxy);

// Legacy endpoints with deprecation warnings
app.get("/users", async (req, res) => {
  logWithMeta("Legacy /users endpoint accessed", { 
    func: "/users",
    level: 'warn',
    extra: {
      deprecationWarning: "This endpoint is deprecated. Use /api/v1/users instead."
    }
  });
  
  res.status(410).json({
    status: 'deprecated',
    message: 'This endpoint has been moved to a dedicated user service.',
    newEndpoint: `${userServiceUrl}/api/v1/users`,
    deprecationDate: '2025-01-01',
    documentation: 'Please migrate to the new user service API.'
  });
});

// Handle undefined routes
// eslint-disable-next-line no-unused-vars
app.all('*', (req, res, _next) => {
  logWithMeta(`Route not found: ${req.method} ${req.originalUrl}`, { 
    func: 'routeNotFound',
    level: 'warn',
    extra: {
      method: req.method, 
      url: req.originalUrl,
      ip: req.ip 
    }
  });
  
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`,
    availableServices: {
      'user-service': userServiceUrl
    }
  });
});

// Global error handling middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  logWithMeta('Unhandled error', {
    func: 'globalErrorHandler',
    level: 'error',
    extra: {
      error: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method
    }
  });

  if (config.isDevelopment) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.isOperational ? err.message : 'Something went wrong!'
    });
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logWithMeta('SIGTERM received, shutting down gracefully', { 
    func: 'gracefulShutdown', 
    level: 'info',
    extra: { signal: 'SIGTERM' }
  });
  process.exit(0);
});

process.on('SIGINT', async () => {
  logWithMeta('SIGINT received, shutting down gracefully', { 
    func: 'gracefulShutdown', 
    level: 'info',
    extra: { signal: 'SIGINT' }
  });
  process.exit(0);
});

const PORT = config.port;
app.listen(PORT, () => {
  logWithMeta(`API Gateway listening on port ${PORT}`, { 
    func: "listen", 
    level: 'info',
    extra: {
      port: PORT,
      environment: config.nodeEnv,
      userServiceUrl: userServiceUrl
    }
  });
});
