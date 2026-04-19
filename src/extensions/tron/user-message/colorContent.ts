import { theme } from "/opt/homebrew/lib/node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/theme/theme.js";

/**
 * Styles the user-message body text.
 *
 * @param text Content text.
 * @returns Styled content text.
 */
export function colorContent(text: string): string {
	return theme.fg("text", text);
}
