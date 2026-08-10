/**
 * Computes the pi-packages modal inner header width.
 *
 * @param terminalWidth Available terminal width.
 * @returns Modal inner header width.
 */
export function getPiPackagesHeaderWidth(terminalWidth: number): number {
	const modalWidth = Math.max(20, Math.min(terminalWidth, Math.max(80, Math.floor(terminalWidth * 0.9))));
	return Math.max(1, modalWidth - 2);
}
