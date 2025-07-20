import { Request, Response } from 'express';
import { logWithMeta } from '@gauravsharmacode/neat-logger';
import config from '../config';

// Extend Error interface for database errors
interface DatabaseError extends Error {
  path?: string;
  value?: any;
  code?: number;
  errmsg?: string;
  errors?: Record<string, { message: string }>;
  isOperational?: boolean;
  statusCode?: number;
  status?: string;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

const handleCastErrorDB = (err: DatabaseError): AppError => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err: DatabaseError): AppError => {
  const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err: DatabaseError): AppError => {
  if (!err.errors) return new AppError('Validation error', 400);
  
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = (): AppError =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = (): AppError =>
  new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err: DatabaseError, req: Request, res: Response): Response => {
  logWithMeta('ERROR 💥', {
    level: 'error',
    extra: {
      error: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip
    }
  });

  return res.status(err.statusCode || 500).json({
    status: err.status,
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name
    },
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err: DatabaseError, req: Request, res: Response): Response => {
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode || 500).json({
      status: err.status,
      message: err.message,
    });
  }

  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  logWithMeta('ERROR 💥', {
    level: 'error',
    extra: {
      error: err.message,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip
    }
  });

  // 2) Send generic message
  return res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Something went wrong!'
  });
};

const globalErrorHandler = (
  err: DatabaseError,
  req: Request,
  res: Response
): Response => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (config.isDevelopment) {
    return sendErrorDev(err, req, res);
  } else {
    let error: DatabaseError = { ...err, message: err.message };

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    return sendErrorProd(error, req, res);
  }
};

export default globalErrorHandler;
