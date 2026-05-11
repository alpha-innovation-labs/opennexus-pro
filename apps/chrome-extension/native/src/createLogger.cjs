const fs = require("fs");
const { LOG_FILE, MAX_LOG_BYTES } = require("./constants.cjs");

/** Rotates the native host log when it exceeds the configured byte limit. */
function rotateLogIfNeeded() {
  try {
    const stats = fs.statSync(LOG_FILE);
    if (stats.size > MAX_LOG_BYTES) fs.renameSync(LOG_FILE, `${LOG_FILE}.1`);
  } catch {}
}

/**
 * Creates the native host logger.
 *
 * @returns {(message: string) => void} Logger function.
 */
function createLogger() {
  return (message) => {
    rotateLogIfNeeded();
    fs.appendFileSync(LOG_FILE, `${new Date().toISOString()} ${message}\n`);
  };
}

module.exports = { createLogger };
