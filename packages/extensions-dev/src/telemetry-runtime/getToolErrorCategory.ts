/**
 * Returns a sanitized tool error category from a tool_result event.
 *
 * @param event Tool result event payload.
 * @returns Error category.
 */
export function getToolErrorCategory(event: unknown): string {
  if (!event || typeof event !== "object") {
    return "unknown";
  }
  const details = (event as { details?: unknown }).details;
  if (details && typeof details === "object" && "error" in details) {
    return "tool_reported_error";
  }
  return "tool_result_error";
}
