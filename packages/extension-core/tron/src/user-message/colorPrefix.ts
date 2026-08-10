import { theme } from "../theme-proxy.js";

/**
 * Styles the user-message prompt prefix.
 *
 * @param text Prefix text.
 * @returns Styled prefix text.
 */
export function colorPrefix(text: string): string {
	return theme.fg("error", text);
}
