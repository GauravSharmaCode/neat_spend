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
    ws: false, // Disable websockets as they can cause issues with POST requests
    timeout: 30000, // 30 second timeout
    proxyTimeout: 30000, // 30 second proxy timeout
    followRedirects: true, // Follow any redirects
    xfwd: true, // Add x-forwarded headers

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
      // For POST requests, ensure the content-length is correct
      if (req.method === "POST" && req.body) {
        const bodyData = JSON.stringify(req.body);
        // Update header
        proxyReq.setHeader("Content-Type", "application/json");
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
        // Write body data
        proxyReq.write(bodyData);
      }

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
  { "^/api": "" } // Remove /api prefix when forwarding to user service
);

export const smsServiceProxy = createServiceProxy(
  "sms-service",
  config.services.smsService,
  { "^/api/v1/sms": "/api/v1" }
);

export const insightServiceProxy = createServiceProxy(
  "insight-service",
  config.services.insightService,
  { "^/api/v1/insights": "/api/v1" }
);
