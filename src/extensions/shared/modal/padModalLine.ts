import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";

/**
 * Truncates and pads a modal line to an exact visible width.
 *
 * @param value Line content.
 * @param width Target visible width.
 * @returns Width-padded line.
 */
export function padModalLine(value: string, width: number): string {
  const truncated = truncateToWidth(value, width, "");
  return `${truncated}${" ".repeat(Math.max(0, width - visibleWidth(truncated)))}`;
}
