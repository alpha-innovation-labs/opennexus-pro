import { smartEvalExpandedState, smartEvalResultsByTimestamp } from "./smartEvalStore.js";

/**
 * Clears all in-memory smart-eval state for the active session.
 */
export function clearSmartEvalState(): void {
	smartEvalResultsByTimestamp.clear();
	smartEvalExpandedState.value = false;
}
