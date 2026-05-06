/**
 * Formats one tool argument value for Telegram live status.
 *
 * @param value Tool argument value.
 * @returns Compact formatted value.
 */
export function formatToolArgValue(value: unknown): string {
  if (typeof value === "string") {
    return JSON.stringify(value.replace(/\s+/g, " ").slice(0, 80));
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return `[${String(value.length)} items]`;
  }

  if (value && typeof value === "object") {
    return "{…}";
  }

  return "null";
}
