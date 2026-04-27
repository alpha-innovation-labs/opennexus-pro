import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";

/**
 * Renders the Neo-style promptline border content between the side corners.
 *
 * @param borderColor Border colorizer.
 * @param uiTheme Active UI theme.
 * @param width Inner content width.
 * @param promptline Promptline left and right segments.
 * @returns Promptline border text.
 */
export function renderPromptlineBorder(
	borderColor: (text: string) => string,
	uiTheme: { fg(color: string, value: string): string },
	width: number,
	promptline: { left: string; right: string },
): string {
	if (width <= 0) return "";
	const leftPrefix = "─ ";
	const rightSuffix = " ─";
	const rightContent = promptline.right;
	const reservedWidth = visibleWidth(leftPrefix) + visibleWidth(rightSuffix) + visibleWidth(rightContent);
	const maxLeftWidth = Math.max(1, width - reservedWidth);
	const leftContent = truncateToWidth(promptline.left, maxLeftWidth, uiTheme.fg("dim", "…"));
	const fillerWidth = Math.max(0, width - visibleWidth(leftPrefix) - visibleWidth(leftContent) - visibleWidth(rightContent) - visibleWidth(rightSuffix));
	return borderColor(leftPrefix) + leftContent + borderColor("─".repeat(fillerWidth)) + rightContent + borderColor(rightSuffix);
}
