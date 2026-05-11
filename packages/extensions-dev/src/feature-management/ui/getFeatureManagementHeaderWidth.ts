/**
 * Computes the feature-management modal inner header width.
 *
 * @param terminalWidth Available terminal width.
 * @returns Modal inner width used by the header row.
 */
export function getFeatureManagementHeaderWidth(terminalWidth: number): number {
	const modalWidth = Math.max(20, Math.min(terminalWidth, Math.max(80, Math.floor(terminalWidth * 0.9))));
	return Math.max(1, modalWidth - 2);
}
