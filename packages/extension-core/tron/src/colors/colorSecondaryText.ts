import { RESET, SECONDARY_TEXT_FG } from "./constants.ts";

/**
 * Styles nexus secondary text with the shared muted gray color.
 *
 * @param text Text to colorize.
 * @returns ANSI-styled text.
 */
export function colorSecondaryText(text: string): string {
	return `${SECONDARY_TEXT_FG}${text}${RESET}`;
}
