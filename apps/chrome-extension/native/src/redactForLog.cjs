/**
 * Redacts large image payloads before native host logging.
 *
 * @param {object} msg Message payload.
 * @returns {string} Safe JSON string for logs.
 */
function redactForLog(msg) {
  return JSON.stringify(msg, (key, value) => {
    if (key === "screenshot" || key === "beforeScreenshot" || key === "afterScreenshot") return "[redacted]";
    if (key === "screenshots") return Array.isArray(value) ? `[${value.length} screenshots]` : "[redacted]";
    if (key === "dataUrl") return "[redacted]";
    return value;
  });
}

module.exports = { redactForLog };
