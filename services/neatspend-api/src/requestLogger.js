// Express middleware to log every request and response using logWithMeta
const { logWithMeta } = require("../../../neatspend-logger");
const { v4: uuidv4 } = require("uuid");

function requestLogger(req, res, next) {
  const start = process.hrtime();
  const requestId = req.headers["x-request-id"] || uuidv4();
  req.requestId = requestId;

  // Log incoming request
  logWithMeta(`Incoming request: ${req.method} ${req.originalUrl}`, {
    func: "requestLogger",
    level: "info",
    extra: {
      requestId,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.headers["user-agent"] || "",
    },
  });

  // Log response when finished
  res.on("finish", () => {
    const [sec, nano] = process.hrtime(start);
    const durationMs = (sec * 1e3 + nano / 1e6).toFixed(2);
    logWithMeta(
      `Response: ${req.method} ${req.originalUrl} ${res.statusCode} (${durationMs}ms)`,
      {
        func: "requestLogger",
        level: "info",
        extra: {
          requestId,
          method: req.method,
          url: req.originalUrl,
          status: res.statusCode,
          durationMs,
        },
      }
    );
  });

  next();
}

module.exports = { requestLogger };
