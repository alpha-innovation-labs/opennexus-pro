import { smartEvalExpandedState } from "./smartEvalStore.js";

/**
 * Returns whether smart-eval details should be shown under assistant footers.
 *
 * @returns Expanded display state.
 */
export function isSmartEvalExpanded(): boolean {
	return smartEvalExpandedState.value;
}
