import { parseTrendingSparklines } from "./parseTrendingSparklines.js";
import type { TrendingAsset } from "./TrendingAsset.js";

/**
 * Parses Jupiter top-trending API payloads into wallet table rows.
 *
 * @param payload Unknown Jupiter response payload.
 * @returns Parsed trending assets.
 */
export function parseTrendingAssets(payload: unknown): TrendingAsset[] {
	const assets = Array.isArray((payload as { assets?: unknown })?.assets) ? (payload as { assets: unknown[] }).assets : [];
	const sparklines = parseTrendingSparklines(payload);
	return assets.flatMap((asset) => {
		const row = asset as Record<string, unknown>;
		const id = String(row.id ?? "");
		const name = String(row.name ?? "");
		const symbol = String(row.symbol ?? "");
		const usdPrice = Number(row.usdPrice);
		const liquidity = Number(row.liquidity ?? 0);
		if (!id || !symbol || !Number.isFinite(usdPrice)) return [];
		const stats6h = row.stats6h as Record<string, unknown> | undefined;
		return [{
			id,
			name,
			symbol,
			usdPrice,
			liquidity,
			mcap: Number.isFinite(Number(row.mcap)) ? Number(row.mcap) : undefined,
			fdv: Number.isFinite(Number(row.fdv)) ? Number(row.fdv) : undefined,
			holderCount: Number.isFinite(Number(row.holderCount)) ? Number(row.holderCount) : undefined,
			stats6h: stats6h ? {
				priceChange: Number.isFinite(Number(stats6h.priceChange)) ? Number(stats6h.priceChange) : undefined,
				buyVolume: Number.isFinite(Number(stats6h.buyVolume)) ? Number(stats6h.buyVolume) : undefined,
				sellVolume: Number.isFinite(Number(stats6h.sellVolume)) ? Number(stats6h.sellVolume) : undefined,
				numTraders: Number.isFinite(Number(stats6h.numTraders)) ? Number(stats6h.numTraders) : undefined,
			} : undefined,
			sparkline: sparklines[id],
		}];
	});
}
