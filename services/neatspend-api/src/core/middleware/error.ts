import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../../interfaces';
import config from '../../config';

// Using require for neat-logger since it doesn't have proper ES modules support
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { logWithMeta } = require("@gauravsharmacode/neat-logger");

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error & { statusCode?: number; status?: string },
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errorWithOperational = err as Error & {
    statusCode?: number;
    status?: string;
    isOperational?: boolean;
  };
  const statusCode = errorWithOperational.statusCode || 500;
  const status = errorWithOperational.status || "error";

  logWithMeta("Unhandled error", {
    func: "globalErrorHandler",
    level: "error",
    extra: {
      error: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
    },
  });

  const errorResponse: ApiError = {
    status: status as "error" | "fail",
    message: errorWithOperational.isOperational
      ? err.message
      : "Something went wrong!",
    statusCode: statusCode,
  };

  if (config.isDevelopment) {
    res.status(statusCode).json({
      ...errorResponse,
      stack: err.stack,
      error: err,
    });
  } else {
    res.status(statusCode).json(errorResponse);
  }
};

/**
 * Handle undefined routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  logWithMeta(`Route not found: ${req.method} ${req.originalUrl}`, {
    func: "routeNotFound",
    level: "warn",
    extra: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
    },
  });

  const errorResponse: ApiError = {
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
    statusCode: 404,
  };

  res.status(404).json({
    ...errorResponse,
    availableServices: {
      "user-service": config.services.userService,
    },
  });
};