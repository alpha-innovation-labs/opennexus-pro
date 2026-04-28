import type { UsageHistoryWindowOption } from "./types.js";

/** In-memory usage history modal selection persisted for the current Nexus process. */
export type UsageHistorySelectionState = {
	modelId?: string;
	window?: UsageHistoryWindowOption;
};

let usageHistorySelectionState: UsageHistorySelectionState = {};

/**
 * Reads the last usage history modal selection for this process.
 *
 * @returns Last selected model id and window.
 */
export function getUsageHistorySelectionState(): UsageHistorySelectionState {
	return { ...usageHistorySelectionState };
}

/**
 * Stores the latest usage history modal selection for this process.
 *
 * @param state Selection state to remember.
 */
export function setUsageHistorySelectionState(state: UsageHistorySelectionState): void {
	usageHistorySelectionState = { ...state };
}

/**
 * Clears remembered usage history modal selection.
 */
export function clearUsageHistorySelectionState(): void {
	usageHistorySelectionState = {};
}
