const { PrismaClient } = require('@prisma/client');

/**
 * Create a standardized database configuration for any service
 * @param {string} serviceName - Name of the service
 * @param {Object} config - Database configuration
 * @returns {Object} Configured Prisma client and utilities
 */
const createDatabaseClient = (serviceName, config = {}) => {
  const {
    databaseUrl = process.env.DATABASE_URL,
    logQueries = process.env.DB_LOG_QUERIES === 'true',
    logSlowQueries = process.env.DB_LOG_SLOW_QUERIES === 'true',
    slowQueryThreshold = parseInt(process.env.DB_SLOW_QUERY_THRESHOLD) || 1000,
    isDevelopment = process.env.NODE_ENV === 'development'
  } = config;

  // Import logger using the shared logger utility
  const { createServiceLogger } = require('../logger');
  const logger = createServiceLogger(`${serviceName}-database`);

  // Prisma query logging middleware
  const queryLogger = () => {
    return async (params, next) => {
      const before = Date.now();
      const result = await next(params);
      const after = Date.now();
      const duration = after - before;

      if (logQueries) {
        const logData = {
          model: params.model,
          action: params.action,
          duration: `${duration}ms`,
          query: params.args ? JSON.stringify(params.args, null, 2) : null
        };

        if (logSlowQueries && duration > slowQueryThreshold) {
          logger.warn('Slow query detected', {
            ...logData,
            slowQuery: true,
            threshold: `${slowQueryThreshold}ms`
          });
        } else if (logQueries) {
          logger.info('Database query executed', logData);
        }
      }

      return result;
    };
  };

  // Create Prisma client with logging configuration
  const prisma = new PrismaClient({
    log: isDevelopment ? [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'info' },
      { emit: 'event', level: 'warn' }
    ] : [
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' }
    ]
  });

  // Add query middleware
  prisma.$use(queryLogger());

  // Event listeners for Prisma logs
  prisma.$on('query', (e) => {
    if (logQueries) {
      logger.debug('Raw SQL Query', {
        query: e.query,
        params: e.params,
        duration: `${e.duration}ms`,
        target: e.target
      });
    }
  });

  prisma.$on('error', (e) => {
    logger.error('Database error', {
      target: e.target,
      message: e.message,
      timestamp: e.timestamp
    });
  });

  prisma.$on('warn', (e) => {
    logger.warn('Database warning', {
      target: e.target,
      message: e.message,
      timestamp: e.timestamp
    });
  });

  prisma.$on('info', (e) => {
    logger.info('Database info', {
      target: e.target,
      message: e.message,
      timestamp: e.timestamp
    });
  });

  // Connection test
  const testConnection = async () => {
    try {
      await prisma.$connect();
      logger.info('Database connection established successfully', {
        service: serviceName
      });
    } catch (error) {
      logger.error('Failed to connect to database', {
        error: error.message,
        service: serviceName
      });
      throw error;
    }
  };

  // Graceful disconnect
  const disconnect = async () => {
    try {
      await prisma.$disconnect();
      logger.info('Database connection closed gracefully', {
        service: serviceName
      });
    } catch (error) {
      logger.error('Error closing database connection', {
        error: error.message,
        service: serviceName
      });
    }
  };

  return {
    prisma,
    testConnection,
    disconnect,
    logger
  };
};

module.exports = {
  createDatabaseClient
};
