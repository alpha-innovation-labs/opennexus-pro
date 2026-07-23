import type { TokenPriceCandle } from "@nexus/mini-apps/wallet/chart/TokenPriceCandle.js";
import type { WalletAccountSnapshot } from "@nexus/mini-apps/wallet/solana/WalletAccountSnapshot.js";
import type { TrendingAsset } from "@nexus/mini-apps/wallet/trending/TrendingAsset.js";

/**
 * Render state for the wallet balance modal.
 */
export interface WalletModalState {
	snapshots: WalletAccountSnapshot[];
	status: string;
	updatedAt: string;
	loading: boolean;
	selectedTokenIndex: number;
	selectedTrendingIndex: number;
	chart?: {
		label: string;
		mint: string;
		candles: TokenPriceCandle[];
		loading: boolean;
		error?: string;
	};
	trending?: {
		assets: TrendingAsset[];
		loading: boolean;
		error?: string;
	};
}
