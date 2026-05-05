import { smartEvalExpandedState } from "./smartEvalStore.js";

/**
 * Sets whether smart-eval details should be shown under assistant footers.
 *
 * @param value Expanded display state.
 */
export function setSmartEvalExpanded(value: boolean): void {
	smartEvalExpandedState.value = value;
}
