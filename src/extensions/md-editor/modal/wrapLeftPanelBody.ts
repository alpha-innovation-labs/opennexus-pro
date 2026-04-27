import { truncateToWidth, visibleWidth, wrapTextWithAnsi } from "@mariozechner/pi-tui";

/**
 * Wraps one styled left-pane body string to the available visible width.
 */
export function wrapLeftPanelBody(body: string, width: number): string[] {
	const safeWidth = Math.max(1, width);
	const wrapped = wrapTextWithAnsi(body, safeWidth).flatMap((line) => line.split(/\r?\n/));
	const lines = wrapped.length > 0 ? wrapped : [""];
	return lines.map((line) => truncateToWidth(line, safeWidth, "")).map((line) => `${line}${" ".repeat(Math.max(0, safeWidth - visibleWidth(line)))}`);
}
