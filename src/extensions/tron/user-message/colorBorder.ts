import { theme } from "/opt/homebrew/lib/node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/theme/theme.js";

/**
 * Styles the user-message border.
 *
 * @param text Border text.
 * @returns Styled border text.
 */
export function colorBorder(text: string): string {
	return theme.fg("error", text);
}
