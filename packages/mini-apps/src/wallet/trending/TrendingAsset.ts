/**
 * One Jupiter top-trending asset row used by the wallet modal.
 */
export interface TrendingAsset {
	id: string;
	name: string;
	symbol: string;
	usdPrice: number;
	liquidity: number;
	mcap?: number;
	fdv?: number;
	holderCount?: number;
	stats6h?: {
		priceChange?: number;
		buyVolume?: number;
		sellVolume?: number;
		numTraders?: number;
	};
}
