import { PRIMARY_ICON_FG, RESET } from "./constants.ts";

/**
 * Styles tool call icons with the shared lavender icon color.
 *
 * @param text Text to colorize.
 * @returns ANSI-styled text.
 */
export function colorToolCallIcon(text: string): string {
	return `${PRIMARY_ICON_FG}${text}${RESET}`;
}
