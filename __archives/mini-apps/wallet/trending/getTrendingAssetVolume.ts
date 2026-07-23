import type { TrendingAsset } from "./TrendingAsset.js";

/**
 * Returns total 6-hour buy plus sell volume for one trending asset.
 *
 * @param asset Trending asset row.
 * @returns Total 6-hour volume.
 */
export function getTrendingAssetVolume(asset: TrendingAsset): number {
	return (asset.stats6h?.buyVolume ?? 0) + (asset.stats6h?.sellVolume ?? 0);
}
