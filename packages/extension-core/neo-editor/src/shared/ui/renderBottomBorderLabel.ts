import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";

/**
 * Renders bottom-border content with a right-aligned status label.
 *
 * @param borderColor Border colorizer.
 * @param uiTheme Active UI theme.
 * @param width Inner content width.
 * @param label Right-aligned label.
 * @returns Bottom-border inner text.
 */
export function renderBottomBorderLabel(
	borderColor: (text: string) => string,
	uiTheme: { fg(color: string, value: string): string },
	width: number,
	label: string,
): string {
	if (width <= 0) return "";
	const rightSuffix = " ─";
	const rawLabel = label ? ` ${label}` : "";
	const truncatedLabel = truncateToWidth(
		rawLabel,
		Math.max(0, width - visibleWidth(rightSuffix)),
		uiTheme.fg("dim", "…"),
	);
	const fillerWidth = Math.max(
		0,
		width - visibleWidth(truncatedLabel) - visibleWidth(rightSuffix),
	);
	return (
		borderColor("─".repeat(fillerWidth)) +
		truncatedLabel +
		borderColor(rightSuffix)
	);
}
