import { Image, Key, matchesKey } from "@earendil-works/pi-tui";
import { DEFAULT_TOKEN_PRICE_CANDLE_COUNT } from "@nexus/mini-apps/wallet/chart/DEFAULT_TOKEN_PRICE_CANDLE_COUNT.js";
import { fetchTokenPriceCandles } from "@nexus/mini-apps/wallet/chart/fetchTokenPriceCandles.js";
import { fetchTopTrendingAssets } from "@nexus/mini-apps/wallet/trending/fetchTopTrendingAssets.js";
import { SharedModal, type SharedModalTheme } from "@nexus/tui-kit/modal/index.js";
import { createWalletModalHeader } from "./createWalletModalHeader.js";
import { createWalletModalPanes } from "./createWalletModalPanes.js";
import { getWalletModalChartAssets } from "./getWalletModalChartAssets.js";
import { getWalletTokenLabel } from "./getWalletTokenLabel.js";
import { sortTrendingAssetsByVolume } from "@nexus/mini-apps/wallet/trending/sortTrendingAssetsByVolume.js";
import type { WalletModalState } from "./WalletModalState.js";

/**
 * Interactive wallet balance cache viewer with token price charts.
 */
export class WalletModal extends SharedModal {
	private readonly onRefresh: () => Promise<void>;
	private readonly onRenderNeeded: () => void;
	private readonly fullScreenRows?: number | (() => number);
	private state: WalletModalState;

	/** Creates a wallet modal. */
	constructor(options: { fullScreenRows?: number | (() => number); onClose: () => void; onRefresh: () => Promise<void>; onRenderNeeded: () => void; state: WalletModalState; theme: SharedModalTheme }) {
		super({ footerLines: ["h trending · j/k select token · Enter chart · r refresh cache · Esc back/close"], fullScreen: true, fullScreenRows: options.fullScreenRows, headerLines: createWalletModalHeader(options.state), minWidth: 80, panes: createWalletModalPanes(options.state, 120, resolveWalletModalRows(options.fullScreenRows)), theme: options.theme, onClose: options.onClose });
		this.fullScreenRows = options.fullScreenRows;
		this.onRefresh = options.onRefresh;
		this.onRenderNeeded = options.onRenderNeeded;
		this.state = options.state;
	}

	/** Handles wallet modal keyboard input. */
	override handleInput(data: string): void {
		if (this.state.chart && (matchesKey(data, Key.escape) || data === "q")) {
			this.setState({ ...this.state, chart: undefined, status: this.state.trending ? "Press Esc to return to balances." : "Showing cached balances." });
			return;
		}
		if (this.state.trending && (matchesKey(data, Key.escape) || data === "q")) {
			this.setState({ ...this.state, chart: undefined, trending: undefined, status: "Showing cached balances." });
			return;
		}
		if (!this.state.chart && this.state.trending && (data === "j" || matchesKey(data, Key.down))) return this.selectTrendingAsset(1);
		if (!this.state.chart && this.state.trending && (data === "k" || matchesKey(data, Key.up))) return this.selectTrendingAsset(-1);
		if (!this.state.chart && this.state.trending && matchesKey(data, Key.enter)) {
			void this.openSelectedTrendingChart();
			return;
		}
		if (!this.state.chart && !this.state.trending && (data === "h" || data === "H")) {
			void this.openTrendingTable();
			return;
		}
		if (!this.state.chart && !this.state.trending && (data === "j" || matchesKey(data, Key.down))) return this.selectAsset(1);
		if (!this.state.chart && !this.state.trending && (data === "k" || matchesKey(data, Key.up))) return this.selectAsset(-1);
		if (!this.state.chart && !this.state.trending && matchesKey(data, Key.enter)) {
			void this.openSelectedTokenChart();
			return;
		}
		if (!this.state.chart && !this.state.trending && (data === "r" || data === "R")) {
			void this.refreshBalances();
			return;
		}
		super.handleInput(data);
	}

	/** Updates the rendered wallet state. */
	setState(state: WalletModalState): void {
		this.state = state;
		this.headerLines = createWalletModalHeader(state);
		this.panes = createWalletModalPanes(state, 120, resolveWalletModalRows(this.fullScreenRows));
		this.onRenderNeeded();
	}

	/** Refreshes balances through the provided action. */
	async refreshBalances(): Promise<void> {
		if (this.state.loading) return;
		this.setState({ ...this.state, loading: true, status: "Refreshing public RPC cache..." });
		await this.onRefresh();
	}

	/** Opens Jupiter's top-trending assets table. */
	private async openTrendingTable(): Promise<void> {
		this.setState({ ...this.state, status: "Loading Jupiter top trending assets...", trending: { assets: [], loading: true } });
		try {
			const assets = await fetchTopTrendingAssets();
			this.setState({ ...this.state, selectedTrendingIndex: 0, status: "Press Esc to return to balances.", trending: { assets, loading: false } });
		} catch (error) {
			const message = error instanceof Error ? error.message : "Trending assets fetch failed.";
			this.setState({ ...this.state, status: message, trending: { assets: [], loading: false, error: message } });
		}
	}

	/** Opens the selected trending token's Jupiter 4-hour price chart. */
	private async openSelectedTrendingChart(): Promise<void> {
		const asset = sortTrendingAssetsByVolume(this.state.trending?.assets ?? [])[this.state.selectedTrendingIndex];
		if (!asset) return;
		await this.openAssetChart(asset.symbol || asset.name || asset.id, asset.id);
	}

	/** Opens the selected token's Jupiter 4-hour price chart. */
	private async openSelectedTokenChart(): Promise<void> {
		const asset = getWalletModalChartAssets(this.state)[this.state.selectedTokenIndex];
		if (!asset) return;
		await this.openAssetChart(asset.label, asset.mint);
	}

	/** Opens a Jupiter 4-hour price chart for one asset. */
	private async openAssetChart(label: string, mint: string): Promise<void> {
		this.setState({ ...this.state, status: "Loading asset price chart...", chart: { label, mint, candles: [], loading: true } });
		try {
			const candles = await fetchTokenPriceCandles(mint, DEFAULT_TOKEN_PRICE_CANDLE_COUNT);
			this.setState({ ...this.state, status: "Press Esc to return.", chart: { label, mint, candles, loading: false } });
		} catch (error) {
			const message = error instanceof Error ? error.message : "Asset price chart failed.";
			this.setState({ ...this.state, status: message, chart: { label, mint, candles: [], loading: false, error: message } });
		}
	}

	/** Moves chartable asset selection by one step. */
	private selectAsset(direction: 1 | -1): void {
		const count = getWalletModalChartAssets(this.state).length;
		if (count === 0) return;
		const next = (this.state.selectedTokenIndex + direction + count) % count;
		this.setState({ ...this.state, selectedTokenIndex: next });
	}

	/** Moves trending asset selection by one step. */
	private selectTrendingAsset(direction: 1 | -1): void {
		const count = Math.min(50, this.state.trending?.assets.length ?? 0);
		if (count === 0) return;
		const next = (this.state.selectedTrendingIndex + direction + count) % count;
		this.setState({ ...this.state, selectedTrendingIndex: next });
	}

	/** Renders the wallet modal and inline token images when terminal supports them. */
	override render(width: number): string[] {
		this.panes = createWalletModalPanes(this.state, Math.max(1, width - 2), resolveWalletModalRows(this.fullScreenRows));
		const lines = super.render(width);
		if (this.state.chart) return lines;
		const tokens = this.state.snapshots.flatMap((snapshot) => snapshot.tokens).filter((token) => token.imageBase64 && token.imageMimeType);
		for (const token of tokens) {
			lines.push(`Token image: ${getWalletTokenLabel(token)}`);
			lines.push(...new Image(token.imageBase64 ?? "", token.imageMimeType ?? "image/png", { fallbackColor: (value) => value }, { maxWidthCells: 8, filename: token.symbol ?? token.mint }).render(width));
		}
		return lines;
	}
}

/**
 * Resolves configured fullscreen rows for chart sizing.
 *
 * @param fullScreenRows Optional row count or supplier.
 * @returns Row count.
 */
function resolveWalletModalRows(fullScreenRows: number | (() => number) | undefined): number {
	if (typeof fullScreenRows === "function") return Math.max(1, Math.floor(fullScreenRows()));
	if (typeof fullScreenRows === "number") return Math.max(1, Math.floor(fullScreenRows));
	return Math.max(1, process.stdout.rows || 40);
}
