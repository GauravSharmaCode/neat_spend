import { Request, Response } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { ApiError } from "../../interfaces";
import config from "../../config";

// Using require for neat-logger since it doesn't have proper ES modules support
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { logWithMeta } = require("@gauravsharmacode/neat-logger");

/**
 * Creates a proxy middleware for a microservice
 * @param serviceName Name of the service (e.g., 'user-service')
 * @param serviceUrl URL of the service
 * @param pathRewrite Path rewrite rules
 * @returns Proxy middleware
 */
export const createServiceProxy = (
  serviceName: string,
  serviceUrl: string,
  pathRewrite: Record<string, string> = {}
) => {
  return createProxyMiddleware({
    target: serviceUrl,
    changeOrigin: true,
    pathRewrite,
    secure: false,
    ws: false,
    timeout: 30000,
    proxyTimeout: 30000,

    // Handle errors
    // @ts-expect-error - http-proxy-middleware types may be incomplete
    onError: (err: Error, req: Request, res: Response) => {
      logWithMeta(`${serviceName} proxy error`, {
        func: "proxyError",
        level: "error",
        extra: {
          error: err.message,
          url: req.url,
          method: req.method,
          target: serviceUrl,
          originalUrl: req.originalUrl,
          headers: req.headers,
        },
      });

      if (!res.headersSent) {
        const errorResponse: ApiError = {
          status: "error",
          message: `${serviceName} is currently unavailable: ${err.message}`,
          statusCode: 503,
          errors: ["SERVICE_UNAVAILABLE"],
        };
        res.status(503).json(errorResponse);
      }
    },

    // Log proxy requests
    onProxyReq: (proxyReq: any, req: Request) => {
      logWithMeta(`Proxying request to ${serviceName}`, {
        func: "proxyRequest",
        level: "info",
        extra: {
          method: req.method,
          path: req.path,
          originalUrl: req.originalUrl,
          target: `${serviceUrl}${req.url}`,
          contentType: req.headers["content-type"],
          bodyLength: req.body ? JSON.stringify(req.body).length : 0,
        },
      });
    },

    // Log proxy responses
    onProxyRes: (proxyRes: any, req: Request) => {
      logWithMeta(`Received response from ${serviceName}`, {
        func: "proxyResponse",
        level: "info",
        extra: {
          statusCode: proxyRes.statusCode,
          method: req.method,
          path: req.path,
          headers: proxyRes.headers,
        },
      });
    },
  });
};

// Create proxies for each service
export const userServiceProxy = createServiceProxy(
  "user-service",
  config.services.userService,
  { "^/v1": "" } // Remove /v1 prefix when forwarding to user service
);

export const smsServiceProxy = createServiceProxy(
  "sms-service",
  config.services.smsService,
  { "^/v1/sms": "/api/v1" }
);

export const insightServiceProxy = createServiceProxy(
  "insight-service",
  config.services.insightService,
  { "^/v1/insights": "/api/v1" }
);
