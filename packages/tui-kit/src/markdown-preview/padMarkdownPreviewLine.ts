import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";

/** Truncates and pads a markdown preview line to the requested visible width. */
export function padMarkdownPreviewLine(value: string, width: number): string {
  const targetWidth = Math.max(0, Math.floor(width));
  const truncated = truncateToWidth(value, targetWidth, "");
  return `${truncated}${" ".repeat(Math.max(0, targetWidth - visibleWidth(truncated)))}`;
}
