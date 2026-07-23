import { truncateToWidth } from "@earendil-works/pi-tui";

/**
 * Renders one focused title cell for the automation modal.
 *
 * @param title Pane title.
 * @param width Cell width.
 * @returns Title cell text.
 */
export function renderAutomationTitleCell(title: string, width: number): string {
	const value = truncateToWidth(`─ ${title} `, width);
	return `${value}${"─".repeat(Math.max(0, width - [...value].length))}`;
}
