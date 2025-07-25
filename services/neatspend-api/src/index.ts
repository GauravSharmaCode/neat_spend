import express, { Application } from "express";
import helmet from "helmet";
import cors from "cors";
import { Server } from "http";

// Using require for neat-logger since it doesn't have proper ES modules support
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { logWithMeta } = require("@gauravsharmacode/neat-logger");

// Import configuration
import config from "./config";

// Import middleware
import { requestLogger } from "./core/middleware/logger";
import { errorHandler, notFoundHandler } from "./core/middleware/error";

// Import routes
import healthRoutes from "./routes/health";
import apiRoutes from "./routes/api";
import legacyRoutes from "./routes/legacy";

// Import utilities
import { gracefulShutdown } from "./core/utils/shutdown";

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS middleware
app.use(cors(config.cors));

// Request logging middleware
app.use(requestLogger);

// Mount routes
app.use("/", healthRoutes);
app.use("/api", apiRoutes);
app.use("/", legacyRoutes);

// Handle undefined routes
app.all("*", notFoundHandler);

// Global error handling middleware
app.use(errorHandler);

// Set up signal handlers for graceful shutdown
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
        userServiceUrl: config.services.userService,
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
