/**
 * Returns a sanitized tool name from a tool event.
 *
 * @param event Tool event payload.
 * @returns Tool name or unknown.
 */
export function getToolName(event: unknown): string {
  if (!event || typeof event !== "object" || !("toolName" in event)) {
    return "unknown";
  }
  const toolName = (event as { toolName?: unknown }).toolName;
  return typeof toolName === "string" && toolName.trim() ? toolName.slice(0, 80) : "unknown";
}
