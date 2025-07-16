const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { logWithMeta } = require('@gauravsharmacode/neat-logger');

const config = require('./config');
const { testConnection, disconnect } = require('./config/database');
const globalErrorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

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

// Health check endpoints
app.get('/', (req, res) => {
  logWithMeta('Root endpoint hit', { func: '/', level: 'info' });
  res.status(200).json({
    status: 'success',
    message: `${config.serviceName} is running!`,
    version: '1.0.0',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  logWithMeta('Health check endpoint hit', { func: '/health', level: 'info' });
  res.status(200).json({
    status: 'success',
    message: 'Service is healthy',
    service: config.serviceName,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage()
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

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
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Global error handling middleware
app.use(globalErrorHandler);

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logWithMeta(`${signal} received, shutting down gracefully`, { 
    func: 'gracefulShutdown', 
    level: 'info',
    extra: { signal }
  });
  
  try {
    await disconnect();
    logWithMeta('Database connection closed', { 
      func: 'gracefulShutdown', 
      level: 'info' 
    });
    process.exit(0);
  } catch (error) {
    logWithMeta('Error during graceful shutdown', { 
      func: 'gracefulShutdown', 
      level: 'error',
      extra: { error: error.message }
    });
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    const server = app.listen(config.port, () => {
      logWithMeta(`${config.serviceName} listening on port ${config.port}`, { 
        func: 'startServer',
        level: 'info',
        extra: {
          port: config.port,
          environment: config.nodeEnv,
          service: config.serviceName
        }
      });
    });

    // Handle server errors
    server.on('error', (error) => {
      logWithMeta('Server error', { 
        func: 'serverError', 
        level: 'error',
        extra: { error: error.message }
      });
      process.exit(1);
    });

    return server;
  } catch (error) {
    logWithMeta('Failed to start server', { 
      func: 'startServer', 
      level: 'error',
      extra: { error: error.message }
    });
    process.exit(1);
  }
};

// Start the server only if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = app;
