import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";
import stripAnsi from "strip-ansi";

/**
 * Pads ANSI content by visible cells while preserving Tron styling when it fits.
 */
export function padVisibleEnd(value: string, width: number): string {
	if (visibleWidth(value) <= width) return `${value}${" ".repeat(Math.max(0, width - visibleWidth(value)))}`;
	const plainValue = stripAnsi(value);
	const safeValue = truncateToWidth(plainValue, width);
	return `${safeValue}${" ".repeat(Math.max(0, width - visibleWidth(safeValue)))}`;
}
