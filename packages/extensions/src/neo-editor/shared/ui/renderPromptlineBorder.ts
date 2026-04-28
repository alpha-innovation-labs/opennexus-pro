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
	const fixedWidth = visibleWidth(leftPrefix) + visibleWidth(rightSuffix);
	if (width <= fixedWidth) return borderColor("─".repeat(width));

	const maxRightWidth = Math.max(0, width - fixedWidth);
	const rightContent = truncateToWidth(promptline.right, maxRightWidth, uiTheme.fg("dim", "…"));
	const maxLeftWidth = Math.max(0, width - fixedWidth - visibleWidth(rightContent));
	const leftContent = maxLeftWidth > 0 ? truncateToWidth(promptline.left, maxLeftWidth, uiTheme.fg("dim", "…")) : "";
	const fillerWidth = Math.max(0, width - visibleWidth(leftPrefix) - visibleWidth(leftContent) - visibleWidth(rightContent) - visibleWidth(rightSuffix));
	return borderColor(leftPrefix) + leftContent + borderColor("─".repeat(fillerWidth)) + rightContent + borderColor(rightSuffix);
}
