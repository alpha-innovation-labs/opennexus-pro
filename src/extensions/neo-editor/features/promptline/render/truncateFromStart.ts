import { visibleWidth } from "@mariozechner/pi-tui";

/**
 * Truncates a string from the start while preserving the end.
 *
 * @param text Source text.
 * @param maxWidth Max visible width.
 * @param ellipsis Ellipsis label.
 * @returns Truncated text.
 */
export function truncateFromStart(text: string, maxWidth: number, ellipsis: string): string {
  if (visibleWidth(text) <= maxWidth) return text;
  const chars = [...text];
  let result = "";
  for (let index = chars.length - 1; index >= 0; index -= 1) {
    const candidate = chars[index] + result;
    if (visibleWidth(ellipsis + candidate) > maxWidth) break;
    result = candidate;
  }
  return ellipsis + result;
}
