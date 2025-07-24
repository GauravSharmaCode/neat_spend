// Using require for neat-logger since it doesn't have proper ES modules support
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { logWithMeta } = require("@gauravsharmacode/neat-logger");

/**
 * Handles graceful shutdown of the server
 * @param signal Signal received (e.g., SIGTERM, SIGINT)
 */
export const gracefulShutdown = async (signal: string): Promise<void> => {
  logWithMeta(`${signal} received, shutting down gracefully`, {
    func: 'gracefulShutdown',
    level: 'info',
    extra: { signal },
  });
  process.exit(0);
};