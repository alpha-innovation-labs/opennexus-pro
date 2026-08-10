/**
 * Computes visible prompt content rows for the fullscreen modal.
 *
 * @param modalRows Total rows available to the fullscreen modal.
 * @returns Visible prompt content row count.
 */
export function getSystemPromptViewportHeight(modalRows: number): number {
	const borderRows = 2;
	const headerRows = 2;
	const footerRows = 2;
	return Math.max(1, modalRows - borderRows - headerRows - footerRows);
}
