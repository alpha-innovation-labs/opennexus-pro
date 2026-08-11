import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import { padToWidth } from "./padToWidth";

/**
 * Applies the Neo prefix treatment to the first visible editor content line.
 *
 * @param line Rendered content line.
 * @param width Available width.
 * @param prefix Prefix text.
 * @param colorize Prefix colorizer.
 * @returns Prefixed line.
 */
export function prefixEditorLine(
	line: string,
	width: number,
	prefix: string,
	colorize: (text: string) => string,
): string {
	const leadingSpacesMatch = line.match(/^ */);
	const leadingSpaces = leadingSpacesMatch?.[0] ?? "";
	const rest = line.slice(leadingSpaces.length);
	const coloredPrefix = colorize(prefix);
	const available = Math.max(
		0,
		width - visibleWidth(leadingSpaces) - visibleWidth(prefix),
	);
	const content = truncateToWidth(rest, available, "");
	return padToWidth(leadingSpaces + coloredPrefix + content, width);
}
