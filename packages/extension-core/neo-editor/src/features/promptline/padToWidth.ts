import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";

/**
 * Pads one rendered line to the requested width.
 *
 * @param line Rendered line.
 * @param width Target width.
 * @returns Width-constrained line.
 */
export function padToWidth(line: string, width: number): string {
  const truncated = truncateToWidth(line, width, "");
  return truncated + " ".repeat(Math.max(0, width - visibleWidth(truncated)));
}
