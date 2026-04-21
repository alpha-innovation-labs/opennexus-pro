import { formatToolArgValue } from "./formatToolArgValue.js";

const TOOL_ARG_KEYS = ["path", "offset", "limit", "pattern", "glob", "ignoreCase", "literal", "command", "timeout", "url", "content", "oldText", "newText", "edits"];

/**
 * Formats tool-call parameters for Telegram live status.
 *
 * @param args Tool arguments payload.
 * @returns Compact parameter summary.
 */
export function formatToolArgs(args: unknown): string {
  if (!args || typeof args !== "object") {
    return "";
  }

  const record = args as Record<string, unknown>;
  const parts = TOOL_ARG_KEYS
    .filter((key) => key in record)
    .map((key) => `${key}=${formatToolArgValue(record[key])}`);

  return parts.join(", ");
}
