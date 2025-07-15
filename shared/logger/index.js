const { createLogger } = require('@gauravsharmacode/neat-logger');

/**
 * Create a standardized logger for any NeatSpend service
 * @param {string} serviceName - Name of the service
 * @param {Object} options - Logger configuration options
 * @returns {Object} Configured logger instance
 */
const createServiceLogger = (serviceName, options = {}) => {
  const {
    level = process.env.LOG_LEVEL || 'info',
    format = process.env.LOG_FORMAT || 'json',
    ...otherOptions
  } = options;

  return createLogger({
    service: serviceName,
    level,
    format,
    ...otherOptions
  });
};

/**
 * Create a request logging middleware for Express
 * @param {string} serviceName - Name of the service
 * @returns {Function} Express middleware function
 */
const createRequestLogger = (serviceName) => {
  const logger = createServiceLogger(`${serviceName}-requests`);

  return (req, res, next) => {
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      logger.info('HTTP Request', {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        contentLength: res.get('Content-Length')
      });
    });

    next();
  };
};

module.exports = {
  createServiceLogger,
  createRequestLogger
};
