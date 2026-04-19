import { theme } from "/opt/homebrew/lib/node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/theme/theme.js";

/**
 * Styles the user-message prompt prefix.
 *
 * @param text Prefix text.
 * @returns Styled prefix text.
 */
export function colorPrefix(text: string): string {
	return theme.fg("error", text);
}
