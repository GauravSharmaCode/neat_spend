// 🔁 Reusable: consider extracting to separate repo
// Logging helper for consistent logs with date, filename, and function name, log levels, and JSON output
const path = require("path");

const LEVELS = ["info", "warn", "error"];

function logWithMeta(message, meta = {}) {
  const now = new Date().toISOString();
  let file = meta.file;
  if (!file) {
    const stack = new Error().stack.split("\n");
    const match = stack[2] && stack[2].match(/\(([^)]+)\)/);
    if (match && match[1]) {
      // Improved: handle Windows/Unix paths, avoid single-letter drive
      const fullPath = match[1].split(":")[0].replace(/^([A-Za-z]):\\?/, "");
      file = path.basename(fullPath);
      if (!file || file.length === 1) file = "unknown";
    } else {
      file = "unknown";
    }
  }
  const func = meta.func || "";
  const level = LEVELS.includes(meta.level) ? meta.level : "info";
  // If durationMs is present and a string, convert to number rounded to 2 decimals
  let extra = { ...meta.extra };
  if (extra && typeof extra.durationMs === "string") {
    const num = Number(extra.durationMs);
    if (!isNaN(num)) extra.durationMs = Math.round(num * 100) / 100;
  }
  const logObj = {
    timestamp: now,
    level,
    file,
    function: func,
    message,
    ...extra, // for any extra fields
  };
  // Output as JSON for log viewers
  console.log(JSON.stringify(logObj));
  // Optional: add transport hooks here (e.g., send to Sentry/Slack/File)
  if (meta.transport && typeof meta.transport === "function") {
    meta.transport(logObj);
  }
}

module.exports = { logWithMeta };
