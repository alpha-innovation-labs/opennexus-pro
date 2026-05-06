import { renderTokenPriceChart } from "@nexus/mini-apps/wallet/chart/renderTokenPriceChart.js";
import { formatWalletSnapshots } from "@nexus/mini-apps/wallet/format/formatWalletSnapshots.js";
import { formatTrendingAssetTable } from "@nexus/mini-apps/wallet/trending/formatTrendingAssetTable.js";
import type { SharedModalPane } from "@nexus/tui-kit/modal/index.js";
import { getWalletModalChartHeight } from "./getWalletModalChartHeight.js";
import type { WalletModalState } from "./WalletModalState.js";

/**
 * Creates wallet modal panes from current balance or chart state.
 *
 * @param state Current wallet modal state.
 * @param contentWidth Available modal content width.
 * @param fullScreenRows Available fullscreen row count.
 * @returns Shared modal panes.
 */
export function createWalletModalPanes(state: WalletModalState, contentWidth = 120, fullScreenRows = 40): SharedModalPane[] {
	if (state.chart) {
		const lines = state.chart.loading
			? [`Loading ${state.chart.label} price chart...`]
			: state.chart.error
				? [state.chart.error]
				: renderTokenPriceChart(state.chart.label, state.chart.candles, Math.max(20, contentWidth - 4), getWalletModalChartHeight(fullScreenRows));
		return [{ id: "wallet-token-chart", size: 1, minWidth: 72, lines }];
	}
	if (state.trending) {
		const lines = state.trending.loading ? ["Loading Jupiter top trending assets..."] : state.trending.error ? [state.trending.error] : formatTrendingAssetTable(state.trending.assets, state.selectedTrendingIndex);
		return [{ id: "wallet-trending", size: 1, minWidth: 72, lines }];
	}
	const balanceLines = state.snapshots.length > 0 ? formatWalletSnapshots(state.snapshots, state.selectedTokenIndex).split("\n") : ["No cached balances yet.", "Press r to refresh SOL and SPL tokens from public Solana RPC."];
	return [{ id: "wallet-balances", size: 1, minWidth: 72, lines: balanceLines }];
}
