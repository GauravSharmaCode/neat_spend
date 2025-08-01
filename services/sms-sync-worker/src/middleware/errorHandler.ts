import { Request, Response, NextFunction } from "express";
import { logWithMeta } from "@gauravsharmacode/neat-logger";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: string;
  public readonly isOperational: boolean;

  /**
   * Creates an instance of the AppError class.
   *
   * @param message - Error message string.
   * @param statusCode - HTTP status code for the error.
   * @param isOperational - Optional boolean indicating if the error is operational
   * (i.e. not a programming error, but a client or network error).
   */
  constructor(
    message: string,
    statusCode: number,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Logs and sends a JSON response with the error stack trace and metadata
 * when the environment is in development mode.
 *
 * @param {AppError} err - The error object, extended from the AppError class.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @returns {void}
 */
const sendErrorDev = (err: AppError, req: Request, res: Response): void => {
  logWithMeta("ERROR 💥", {
    level: "error",
    extra: {
      error: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
    },
  });
  res.status(err.statusCode || 500).json({
    status: err.status,
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name,
    },
    message: err.message,
    stack: err.stack,
  });
};

/**
 * Global error handling middleware for Express applications.
 *
 * Logs error details and sends a structured JSON response based on the environment.
 * In development, includes stack trace for debugging. In production, logs error
 * and sends minimal error information to the client.
 *
 * @param {AppError} err - The error object, extended from the AppError class.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} _next - Express next middleware function, not used.
 * @returns {void}
 */
const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction // eslint-disable-line @typescript-eslint/no-unused-vars
): void => {
  // Use local variables to avoid mutating read-only properties
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else {
    // Use local variables in response
    if (err.isOperational) {
      res.status(statusCode).json({
        status,
        message: err.message,
      });
    } else {
      logWithMeta("ERROR 💥", {
        level: "error",
        extra: {
          error: err.message,
          url: req.originalUrl,
          method: req.method,
          ip: req.ip,
        },
      });
      res.status(statusCode).json({
        status: "error",
        message: err.message || "Something went wrong!",
      });
    }
  }
};

export default globalErrorHandler;
