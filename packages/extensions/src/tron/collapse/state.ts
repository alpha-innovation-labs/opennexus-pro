let toolGroupCollapseEnabled = false;

/**
 * Stores whether Tron should collapse tool groups into one summary row.
 */
export function isToolGroupCollapseEnabled(): boolean {
	return false;
}

/**
 * Sets whether Tron should collapse tool groups into one summary row.
 *
 * @param enabled Next collapse state.
 */
export function setToolGroupCollapseEnabled(enabled: boolean): void {
	toolGroupCollapseEnabled = enabled;
}

/**
 * Toggles the collapsed tool-group mode.
 *
 * @returns The next collapse state.
 */
export function toggleToolGroupCollapse(): boolean {
	toolGroupCollapseEnabled = !toolGroupCollapseEnabled;
	return toolGroupCollapseEnabled;
}
