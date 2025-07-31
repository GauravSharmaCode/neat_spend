import { Request, Response, NextFunction } from "express";
import { logWithMeta } from "@gauravsharmacode/neat-logger";
import { ApiError } from "../interfaces";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

const sendErrorDev = (err: AppError, req: Request, res: Response): Response => {
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
  return res.status(err.statusCode || 500).json({
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

const sendErrorProd = (err: AppError, req: Request, res: Response): Response => {
  if (err.isOperational) {
    return res.status(err.statusCode || 500).json({
      status: err.status,
      message: err.message,
    });
  }
  logWithMeta("ERROR 💥", {
    level: "error",
    extra: {
      error: err.message,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
    },
  });
  return res.status(err.statusCode || 500).json({
    status: "error",
    message: err.message || "Something went wrong!",
  });
};

const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  // Use local variables to avoid mutating read-only properties
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    return sendErrorDev(err, req, res);
  } else {
    // Use local variables in response
    if (err.isOperational) {
      return res.status(statusCode).json({
        status,
        message: err.message,
      });
    }
    logWithMeta("ERROR 💥", {
      level: "error",
      extra: {
        error: err.message,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
      },
    });
    return res.status(statusCode).json({
      status: "error",
      message: err.message || "Something went wrong!",
    });
  }
};

export default globalErrorHandler;
