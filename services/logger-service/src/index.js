const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const { createLogger } = require('@gauravsharmacode/neat-logger');
const config = require('./config');

const logger = createLogger({
  service: 'logger-service',
  level: config.logging.level
});

const app = express();

// Security middleware
app.use(helmet());

// CORS middleware
app.use(cors(config.cors));

// Compression middleware
app.use(compression());

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  });

  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  logger.info('Health check endpoint hit', { func: '/health' });
  res.status(200).json({
    status: 'success',
    message: 'Logger Service is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'logger-service',
    version: '0.1.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  logger.info('Root endpoint hit', { func: '/' });
  res.status(200).json({
    status: 'success',
    message: 'NeatSpend Logger Service',
    version: '0.1.0',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      logs: '/api/v1/logs'
    }
  });
});

// Centralized logging endpoint
app.post('/api/v1/logs', (req, res) => {
  try {
    const { level = 'info', message, metadata = {}, service } = req.body;

    if (!message) {
      return res.status(400).json({
        status: 'error',
        message: 'Log message is required'
      });
    }

    // Log the received message with metadata
    const logData = {
      ...metadata,
      sourceService: service || 'unknown',
      timestamp: new Date().toISOString()
    };

    switch (level) {
      case 'error':
        logger.error(message, logData);
        break;
      case 'warn':
        logger.warn(message, logData);
        break;
      case 'info':
      default:
        logger.info(message, logData);
        break;
    }

    res.status(200).json({
      status: 'success',
      message: 'Log recorded successfully'
    });
  } catch (error) {
    logger.error('Error processing log request', { 
      error: error.message,
      body: req.body 
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to process log request'
    });
  }
});

// Batch logging endpoint
app.post('/api/v1/logs/batch', (req, res) => {
  try {
    const { logs } = req.body;

    if (!Array.isArray(logs)) {
      return res.status(400).json({
        status: 'error',
        message: 'Logs must be an array'
      });
    }

    let processed = 0;
    let errors = 0;

    logs.forEach(logEntry => {
      try {
        const { level = 'info', message, metadata = {}, service } = logEntry;

        if (!message) {
          errors++;
          return;
        }

        const logData = {
          ...metadata,
          sourceService: service || 'unknown',
          timestamp: new Date().toISOString()
        };

        switch (level) {
          case 'error':
            logger.error(message, logData);
            break;
          case 'warn':
            logger.warn(message, logData);
            break;
          case 'info':
          default:
            logger.info(message, logData);
            break;
        }

        processed++;
      } catch (error) {
        errors++;
        logger.error('Error processing individual log entry', { 
          error: error.message,
          logEntry 
        });
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Batch logs processed',
      processed,
      errors,
      total: logs.length
    });
  } catch (error) {
    logger.error('Error processing batch log request', { 
      error: error.message
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to process batch log request'
    });
  }
});

// Handle undefined routes
app.all('*', (req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`, { 
    method: req.method, 
    url: req.originalUrl,
    ip: req.ip 
  });
  
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });

  res.status(err.statusCode).json({
    status: err.status,
    message: config.isDevelopment ? err.message : 'Something went wrong!'
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`Logger Service listening on port ${PORT}`, { 
    func: "listen", 
    port: PORT,
    environment: config.nodeEnv
  });
});

module.exports = app;
