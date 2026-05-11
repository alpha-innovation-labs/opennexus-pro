import { pendingHealthChecks, pendingWorkspacePickers } from "./state.js";
import { getRequestId } from "./get-request-id.js";

/**
 * Resolves every popup health check waiting for a native host response.
 *
 * @param {{ ok: boolean, error?: string }} response Native host health result.
 */
export function settlePendingHealthChecks(response) {
  for (const check of pendingHealthChecks) {
    clearTimeout(check.timeoutId);
    check.sendResponse(response);
  }
  pendingHealthChecks.clear();
}

/**
 * Resolves one pending workspace picker response from native host output.
 *
 * @param {object} msg Native host response payload.
 * @returns {boolean} True when the message matched a pending picker.
 */
export function settlePendingWorkspacePicker(msg) {
  const requestId = getRequestId(msg);
  const pending = requestId ? pendingWorkspacePickers.get(requestId) : null;
  if (!pending || !requestId) return false;
  pendingWorkspacePickers.delete(requestId);
  clearTimeout(pending.timeoutId);
  pending.sendResponse(msg.path ? { ok: true, path: msg.path } : { ok: false, cancelled: Boolean(msg.cancelled), error: msg.error });
  return true;
}
