let compactModeThinkingExpanded = false;

/**
 * Stores whether compact mode should render full thinking text.
 *
 * @param expanded Whether thinking is expanded.
 */
export function setCompactModeThinkingExpanded(expanded: boolean): void {
	compactModeThinkingExpanded = expanded;
}

/**
 * Returns whether compact mode should render full thinking text.
 */
export function isCompactModeThinkingExpanded(): boolean {
	return compactModeThinkingExpanded;
}
