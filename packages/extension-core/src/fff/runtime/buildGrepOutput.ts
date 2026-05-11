import type { GrepMatch } from "@ff-labs/fff-node";

/**
 * Formats grep matches for tool output.
 *
 * @param items Matched grep rows.
 * @param nextCursor Continuation cursor.
 * @returns Formatted grep output.
 */
export function buildGrepOutput(items: GrepMatch[], nextCursor?: string): string {
  if (items.length === 0) {
    return "No matches found.";
  }

  const lines = items.map((item) => `${item.relativePath}:${item.lineNumber}: ${item.lineContent.trimEnd()}`);
  if (nextCursor) {
    lines.push("", `cursor: ${nextCursor}`);
  }
  return lines.join("\n");
}
