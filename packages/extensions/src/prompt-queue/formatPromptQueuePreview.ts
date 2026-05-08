import { truncateToWidth } from "@mariozechner/pi-tui";

/**
 * Formats one queued prompt for compact single-line display.
 *
 * @param text Prompt text to display.
 * @param width Available text width.
 * @returns Single-line queue preview.
 */
export function formatPromptQueuePreview(text: string, width: number): string {
  const lines = text.split(/\r?\n/u).map((line) => line.trim()).filter(Boolean);
  const firstLine = lines[0] ?? text.trim();
  const suffix = lines.length > 1 ? ` ↵ ${lines.length} lines` : "";
  return truncateToWidth(`${firstLine}${suffix}`.replace(/\s+/gu, " "), Math.max(1, width), "…");
}
