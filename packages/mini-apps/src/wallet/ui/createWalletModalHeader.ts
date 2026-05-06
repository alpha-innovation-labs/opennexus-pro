import type { WalletModalState } from "./WalletModalState.js";

/**
 * Creates wallet modal header lines.
 *
 * @param state Current wallet modal state.
 * @returns Header lines.
 */
export function createWalletModalHeader(state: WalletModalState): string[] {
	if (state.trending) return ["Jupiter top trending · 6h", "Source: datapi.jup.ag · includeSparklines=true", state.status];
	if (state.chart) return [`${state.chart.label} price chart`, "Interval: 4 hours · Quote: USD", state.status];
	const updated = state.updatedAt ? `Cached: ${state.updatedAt}` : "Cached: never";
	return ["Wallet balances", updated, state.status];
}
