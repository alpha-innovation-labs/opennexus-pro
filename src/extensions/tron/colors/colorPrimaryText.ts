import { PRIMARY_TEXT_FG, RESET } from "./constants.ts";

/**
 * Styles nexus section titles with the shared primary rose color.
 *
 * @param text Text to colorize.
 * @returns ANSI-styled text.
 */
export function colorPrimaryText(text: string): string {
	return `${PRIMARY_TEXT_FG}${text}${RESET}`;
}
