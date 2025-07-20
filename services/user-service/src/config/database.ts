import { PrismaClient } from '@prisma/client';
import { logWithMeta } from '@gauravsharmacode/neat-logger';
import config from '../config';
import type { PrismaLogEvent } from '../interfaces';

// Prisma query logging middleware  
const queryLogger = () => {
  return async (params: any, next: (params: any) => Promise<any>) => {
    const before = Date.now();
    const result = await next(params);
    const after = Date.now();
    const duration = after - before;

    if (config.database.logQueries) {
      const logData = {
        model: params.model,
        action: params.action,
        duration: `${duration}ms`,
        query: params.args ? JSON.stringify(params.args, null, 2) : null
      };

      if (config.database.logSlowQueries && duration > config.database.slowQueryThreshold) {
        logWithMeta('Slow query detected', {
          func: 'queryLogger',
          level: 'warn',
          extra: {
            ...logData,
            slowQuery: true,
            threshold: `${config.database.slowQueryThreshold}ms`
          }
        });
      } else if (config.database.logQueries) {
        logWithMeta('Database query executed', {
          func: 'queryLogger',
          level: 'info',
          extra: logData
        });
      }
    }

    return result;
  };
};

// Create Prisma client with logging configuration
const prisma = new PrismaClient({
  log: config.isDevelopment ? [
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
prisma.$on('query', (e: any) => {
  if (config.database.logQueries) {
    logWithMeta('Raw SQL Query', {
      func: 'prismaQuery',
      level: 'info',
      extra: {
        query: e.query,
        params: e.params,
        durationMs: e.duration,
        target: e.target
      }
    });
  }
});

prisma.$on('error', (e: PrismaLogEvent) => {
  logWithMeta('Database error', {
    func: 'prismaError',
    level: 'error',
    extra: {
      target: e.target,
      message: e.message,
      timestamp: e.timestamp
    }
  });
});

prisma.$on('warn', (e: PrismaLogEvent) => {
  logWithMeta('Database warning', {
    func: 'prismaWarn',
    level: 'warn',
    extra: {
      target: e.target,
      message: e.message,
      timestamp: e.timestamp
    }
  });
});

prisma.$on('info', (e: PrismaLogEvent) => {
  logWithMeta('Database info', {
    func: 'prismaInfo',
    level: 'info',
    extra: {
      target: e.target,
      message: e.message,
      timestamp: e.timestamp
    }
  });
});

// Connection test
const testConnection = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logWithMeta('Database connection established successfully', {
      func: 'testConnection',
      level: 'info',
      extra: {
        service: config.serviceName
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logWithMeta('Failed to connect to database', {
      func: 'testConnection',
      level: 'error',
      extra: {
        error: errorMessage,
        service: config.serviceName
      }
    });
    throw error;
  }
};

// Graceful disconnect
const disconnect = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logWithMeta('Database connection closed gracefully', {
      func: 'disconnect',
      level: 'info',
      extra: {
        service: config.serviceName
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logWithMeta('Error closing database connection', {
      func: 'disconnect',
      level: 'error',
      extra: {
        error: errorMessage,
        service: config.serviceName
      }
    });
  }
};

export {
  prisma,
  testConnection,
  disconnect
};
