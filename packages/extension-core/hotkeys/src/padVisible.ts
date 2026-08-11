import { visibleWidth } from "@earendil-works/pi-tui";

/**
 * Pads one string to a target terminal cell width.
 *
 * @param value String that may include ANSI styling.
 * @param width Target visible width.
 * @returns Padded string.
 */
export function padVisible(value: string, width: number): string {
	return value + " ".repeat(Math.max(0, width - visibleWidth(value)));
}
