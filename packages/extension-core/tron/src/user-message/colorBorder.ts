import { theme } from "../theme-proxy";

/**
 * Styles the user-message border.
 *
 * @param text Border text.
 * @returns Styled border text.
 */
export function colorBorder(text: string): string {
	return theme.fg("error", text);
}
