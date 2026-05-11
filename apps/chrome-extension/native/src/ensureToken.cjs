const fs = require("fs");
const crypto = require("crypto");
const { TOKEN_PATH } = require("./constants.cjs");

/**
 * Creates the authentication token consumed by the Nexus TUI socket client.
 *
 * @param {(message: string) => void} log Native host logger.
 * @returns {string|null} Authentication token.
 */
function ensureToken(log) {
  try {
    const token = crypto.randomBytes(32).toString("hex");
    fs.writeFileSync(TOKEN_PATH, token, { mode: 0o600 });
    return token;
  } catch (err) {
    log(`Failed to create token: ${err.message}`);
    return null;
  }
}

module.exports = { ensureToken };
