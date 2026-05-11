import stripAnsi from "strip-ansi";
import { visibleWidth } from "@earendil-works/pi-tui";
import { truncateAnsiToWidth } from "./truncateAnsiToWidth.js";

/**
 * Truncates and pads a modal line to an exact visible width.
 *
 * @param value Line content.
 * @param width Target visible width.
 * @returns Width-padded line.
 */
export function padModalLine(value: string, width: number): string {
  const truncated = truncateAnsiToWidth(value, width);
  const visible = visibleWidth(stripAnsi(truncated));
  return `${truncated}${" ".repeat(Math.max(0, width - visible))}`;
}
