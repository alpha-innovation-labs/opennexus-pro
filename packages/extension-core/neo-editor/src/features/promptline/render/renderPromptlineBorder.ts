import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";

/**
 * Renders the top promptline border row.
 *
 * @param borderColor Border color formatter.
 * @param uiTheme UI theme.
 * @param width Available width.
 * @param promptline Promptline segments.
 * @returns Rendered border content.
 */
export function renderPromptlineBorder(
	borderColor: (text: string) => string,
	uiTheme: ExtensionContext["ui"]["theme"],
	width: number,
	promptline: { left: string; right: string },
): string {
	if (width <= 0) return "";

	const leftPrefix = "─ ";
	const rightSuffix = " ─";
	const fixedWidth = visibleWidth(leftPrefix) + visibleWidth(rightSuffix);
	if (width <= fixedWidth) return borderColor("─".repeat(width));

	const maxRightWidth = Math.max(0, width - fixedWidth);
	const rightContent = truncateToWidth(
		promptline.right,
		maxRightWidth,
		uiTheme.fg("dim", "…"),
	);
	const maxLeftWidth = Math.max(
		0,
		width - fixedWidth - visibleWidth(rightContent),
	);
	const leftContent =
		maxLeftWidth > 0
			? truncateToWidth(promptline.left, maxLeftWidth, uiTheme.fg("dim", "…"))
			: "";
	const fillerWidth = Math.max(
		0,
		width -
			visibleWidth(leftPrefix) -
			visibleWidth(leftContent) -
			visibleWidth(rightContent) -
			visibleWidth(rightSuffix),
	);
	return (
		borderColor(leftPrefix) +
		leftContent +
		borderColor("─".repeat(fillerWidth)) +
		rightContent +
		borderColor(rightSuffix)
	);
}
