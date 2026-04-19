import { wrapTextWithAnsi } from "@mariozechner/pi-tui";

/**
 * Renders one error transcript entry.
 *
 * @param text Error text.
 * @param theme Active Pi theme.
 * @param width Available content width.
 * @returns Rendered error lines.
 */
export function renderErrorEntry(text: string, theme: any, width: number): string[] {
	return wrapTextWithAnsi(theme.fg("error", text), width);
}
