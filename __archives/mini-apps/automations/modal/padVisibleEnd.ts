import { truncateToWidth } from "@earendil-works/pi-tui";

/**
 * Pads a rendered string without exceeding a visible width budget.
 *
 * @param value Text to pad.
 * @param width Target visible width.
 * @returns Padded text.
 */
export function padVisibleEnd(value: string, width: number): string {
	const truncated = truncateToWidth(value, width);
	return `${truncated}${" ".repeat(Math.max(0, width - [...truncated].length))}`;
}
