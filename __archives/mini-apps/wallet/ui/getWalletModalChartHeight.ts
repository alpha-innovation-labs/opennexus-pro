/**
 * Calculates the row budget for a fullscreen wallet chart.
 *
 * @param fullScreenRows Terminal row count used by the modal.
 * @returns Chart row budget.
 */
export function getWalletModalChartHeight(fullScreenRows: number): number {
	return Math.max(8, fullScreenRows - 8);
}
