/**
 * Returns a sanitized session start mode from a session_start event.
 *
 * @param event Session event payload.
 * @returns Session mode.
 */
export function getSessionMode(event: unknown): string {
  if (!event || typeof event !== "object" || !("reason" in event)) {
    return "unknown";
  }
  const reason = (event as { reason?: unknown }).reason;
  return typeof reason === "string" && reason.trim() ? reason.slice(0, 40) : "unknown";
}
