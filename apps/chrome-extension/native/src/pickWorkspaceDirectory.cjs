const { execFile } = require("child_process");

/**
 * Opens the macOS folder picker through the native host so Chrome receives a POSIX path.
 *
 * @param {number|null} requestId Request id to echo back to the extension.
 * @param {(message: object) => void} writeMessage Native messaging writer.
 */
function pickWorkspaceDirectory(requestId, writeMessage) {
  const script = 'POSIX path of (choose folder with prompt "Select Nexus workspace directory")';
  execFile("osascript", ["-e", script], { timeout: 120000 }, (error, stdout) => {
    if (error) {
      writeMessage({ type: "WORKSPACE_DIR_SELECTED", requestId, cancelled: true, error: error.message });
      return;
    }
    writeMessage({ type: "WORKSPACE_DIR_SELECTED", requestId, path: stdout.trim().replace(/\/$/, "") });
  });
}

module.exports = { pickWorkspaceDirectory };
