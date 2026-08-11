import { visibleWidth } from "@earendil-works/pi-tui";

/**
 * Truncates plain terminal text to a target visible cell width.
 *
 * @param value Plain text to truncate.
 * @param width Maximum visible terminal cell width.
 * @returns Text that fits within the requested visible width.
 */
export function truncateVisible(value: string, width: number): string {
	if (width <= 0) return "";
	let output = "";
	for (const character of value) {
		if (visibleWidth(output + character) > width) break;
		output += character;
	}
	return output;
}
