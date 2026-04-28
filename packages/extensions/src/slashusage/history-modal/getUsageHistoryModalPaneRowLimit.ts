export const USAGE_HISTORY_MODAL_CHROME_ROWS = 6;
export const USAGE_HISTORY_MODAL_MAX_HEIGHT_RATIO = 0.85;

/**
 * Calculates available usage chart pane rows inside the modal height budget.
 *
 * @param terminalRows Available terminal rows.
 * @param maxHeightRatio Overlay height ratio used by the modal.
 * @returns Maximum rows available to modal pane content.
 */
export function getUsageHistoryModalPaneRowLimit(terminalRows: number, maxHeightRatio = USAGE_HISTORY_MODAL_MAX_HEIGHT_RATIO): number {
	const modalRows = Math.max(1, Math.floor(terminalRows * maxHeightRatio));
	return Math.max(1, modalRows - USAGE_HISTORY_MODAL_CHROME_ROWS);
}
