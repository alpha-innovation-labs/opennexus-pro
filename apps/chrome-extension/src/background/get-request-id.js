/**
 * Extracts a numeric request id from native or content-script messages.
 *
 * @param {object} msg Message payload.
 * @returns {number|null} Request id when present.
 */
export function getRequestId(msg) {
  return typeof msg.requestId === "number" ? msg.requestId : (typeof msg.id === "number" ? msg.id : null);
}
