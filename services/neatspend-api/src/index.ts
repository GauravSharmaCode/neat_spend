import express, { Request, Response, NextFunction, Application } from "express";
import helmet from "helmet";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";
import { Server } from "http";

// Using require for neat-logger since it doesn't have proper ES modules support
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { logWithMeta } = require("@gauravsharmacode/neat-logger");
import config from "./config";

import { HealthResponse, HealthCheck, ApiError } from "./interfaces";

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS middleware
app.use(cors(config.cors));

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    logWithMeta("HTTP Request", {
      func: "requestLogger",
      level: "info",
      extra: {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: duration,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      },
    });
  });

  next();
});

// Health check endpoint
app.get("/", (req: Request, res: Response) => {
  logWithMeta("Root endpoint hit", { func: "/", level: "info" });
  res.status(200).json({
    status: "success",
    message: "NeatSpend API Gateway is running!",
    version: "1.0.0",
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
    services: {
      "user-service": userServiceUrl,
      "api-gateway": `http://localhost:${config.port}`,
    },
  });
});

// Health check endpoint with service connectivity
app.get("/health", async (req: Request, res: Response) => {
  logWithMeta("Health check endpoint hit", { func: "/health", level: "info" });

  const healthStatus: HealthResponse = {
    status: "success",
    message: "API Gateway is healthy",
    service: "neatspend-api",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    services: {},
  };

  // Check user service health
  try {
    const userServiceHealthUrl = `${userServiceUrl}/health`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(userServiceHealthUrl, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    clearTimeout(timeoutId);
    const userHealthCheck: HealthCheck = {
      service: "user-service",
      status: response.ok ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      responseTime: response.headers.get("x-response-time")
        ? parseInt(response.headers.get("x-response-time")!)
        : undefined,
    };

    healthStatus.services!["user-service"] = userHealthCheck;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const userHealthCheck: HealthCheck = {
      service: "user-service",
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: errorMessage,
    };

    healthStatus.services!["user-service"] = userHealthCheck;
    healthStatus.status = "success"; // Still return success, just note service is down
  }

  const statusCode = healthStatus.status === "success" ? 200 : 503;
  res.status(statusCode).json(healthStatus);
});

// Proxy routes to microservices
const userServiceUrl: string = config.services.userService;

// User service proxy with circuit breaker
const userServiceProxy = createProxyMiddleware({
  target: userServiceUrl,
  changeOrigin: true,
  timeout: 1000, // Very short timeout for immediate failure detection
  proxyTimeout: 1000, // Very short timeout for immediate failure detection
  // Handle all proxy errors including timeouts

  /**
   * Handles errors that occur during the proxying of requests to the user service.
   * Logs the error and sends a standardized error response.
   * @param {Error} err - The error that occurred during proxying.
   * @param {Request} req - The original request object.
   * @param {Response} res - The response object to send the error response.
   */
  // @ts-expect-error - http-proxy-middleware types may be incomplete
  onError: (err: Error, req: Request, res: Response) => {
    logWithMeta("User service proxy error", {
      func: "proxyError",
      level: "error",
      extra: {
        error: err.message,
        url: req.url,
        target: userServiceUrl,
      },
    });

    const errorResponse: ApiError = {
      status: "error",
      message: "User service is currently unavailable",
      statusCode: 503,
      errors: ["SERVICE_UNAVAILABLE"],
    };

    res.status(503).json(errorResponse);
  },
  /**
   * Logs when a request is being proxied to the user service.
   * @param {unknown} proxyReq - The proxied request object
   * @param {Request} req - The original request object
   */
  onProxyReq: (proxyReq: unknown, req: Request) => {
    logWithMeta("Proxying request to user service", {
      func: "proxyRequest",
      level: "info",
      extra: {
        method: req.method,
        path: req.path,
        target: userServiceUrl,
      },
    });
  },
  /**
   * Logs information about the response received from the user service.
   * @param proxyRes - The proxied response object.
   * @param req - The original request object.
   */
  onProxyRes: (proxyRes: unknown, req: Request) => {
    const proxyResponse = proxyRes as { statusCode: number };
    logWithMeta("Received response from user service", {
      func: "proxyResponse",
      level: "info",
      extra: {
        statusCode: proxyResponse.statusCode,
        method: req.method,
        path: req.path,
      },
    });
  },
});

// Route all user-related requests to user service
app.use("/api/v1/auth", userServiceProxy);
app.use("/api/v1/users", userServiceProxy);

// Legacy endpoints with deprecation warnings
app.get("/users", async (req: Request, res: Response) => {
  logWithMeta("Legacy /users endpoint accessed", {
    func: "/users",
    level: "warn",
    extra: {
      deprecationWarning:
        "This endpoint is deprecated. Use /api/v1/users instead.",
    },
  });

  res.status(410).json({
    status: "deprecated",
    message: "This endpoint has been moved to a dedicated user service.",
    newEndpoint: `${userServiceUrl}/api/v1/users`,
    deprecationDate: "2025-01-01",
    documentation: "Please migrate to the new user service API.",
  });
});

// Handle undefined routes
app.all("*", (req: Request, res: Response) => {
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
      "user-service": userServiceUrl,
    },
  });
});

// Global error handling middleware
app.use(
  (
    err: Error & { statusCode?: number; status?: string },
    req: Request,
    res: Response
  ) => {
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
  }
);

// Graceful shutdown
const gracefulShutdown = async (signal: string): Promise<void> => {
  logWithMeta(`${signal} received, shutting down gracefully`, {
    func: "gracefulShutdown",
    level: "info",
    extra: { signal },
  });
  process.exit(0);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Start server
const startServer = (): Server => {
  const server = app.listen(config.port, () => {
    logWithMeta(`API Gateway listening on port ${config.port}`, {
      func: "listen",
      level: "info",
      extra: {
        port: config.port,
        environment: config.nodeEnv,
        userServiceUrl: userServiceUrl,
      },
    });
  });

  return server;
};

// Start the server only if this file is run directly
if (require.main === module) {
  startServer();
}

export default app;
