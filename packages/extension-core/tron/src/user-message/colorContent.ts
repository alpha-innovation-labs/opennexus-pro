import { theme } from "../theme-proxy";

/**
 * Styles the user-message body text.
 *
 * @param text Content text.
 * @returns Styled content text.
 */
export function colorContent(text: string): string {
	return theme.fg("text", text);
}
