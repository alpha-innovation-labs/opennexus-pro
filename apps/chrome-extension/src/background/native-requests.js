import { nativePort, pendingHealthChecks, pendingWorkspacePickers } from "./state.js";
import { connectNative } from "./native-port.js";

/**
 * Checks the existing background-owned native host connection for the popup.
 *
 * @param {(response: { ok: boolean, error?: string }) => void} sendResponse Chrome response callback.
 */
export function checkNativeConnection(sendResponse) {
  const port = nativePort || connectNative();
  if (!port) {
    sendResponse({ ok: false, error: "Native host not available" });
    return;
  }
  const check = {
    sendResponse,
    timeoutId: setTimeout(() => {
      if (!pendingHealthChecks.delete(check)) return;
      sendResponse({ ok: false, error: "Timeout - native host not responding" });
    }, 3000),
  };
  pendingHealthChecks.add(check);
  try {
    port.postMessage({ type: "PING" });
  } catch (err) {
    if (pendingHealthChecks.delete(check)) {
      clearTimeout(check.timeoutId);
      sendResponse({ ok: false, error: err?.message || "Failed to ping native host" });
    }
  }
}

/**
 * Opens the native host folder picker and returns the selected POSIX path.
 *
 * @param {(response: { ok: boolean, path?: string, cancelled?: boolean, error?: string }) => void} sendResponse Chrome response callback.
 */
export function pickWorkspaceDirectory(sendResponse) {
  const port = nativePort || connectNative();
  if (!port) {
    sendResponse({ ok: false, error: "Native host not available" });
    return;
  }
  const requestId = Date.now();
  const timeoutId = setTimeout(() => {
    if (!pendingWorkspacePickers.delete(requestId)) return;
    sendResponse({ ok: false, error: "Timeout - folder picker did not return" });
  }, 120000);
  pendingWorkspacePickers.set(requestId, { sendResponse, timeoutId });
  try {
    port.postMessage({ type: "PICK_WORKSPACE_DIR", requestId });
  } catch (err) {
    if (pendingWorkspacePickers.delete(requestId)) {
      clearTimeout(timeoutId);
      sendResponse({ ok: false, error: err?.message || "Failed to open folder picker" });
    }
  }
}
