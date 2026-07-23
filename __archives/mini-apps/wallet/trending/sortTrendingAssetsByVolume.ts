import { getTrendingAssetVolume } from "./getTrendingAssetVolume.js";
import type { TrendingAsset } from "./TrendingAsset.js";

/**
 * Sorts trending assets by descending 6-hour volume.
 *
 * @param assets Trending assets.
 * @returns Volume-sorted assets.
 */
export function sortTrendingAssetsByVolume(assets: readonly TrendingAsset[]): TrendingAsset[] {
	return [...assets].sort((left, right) => getTrendingAssetVolume(right) - getTrendingAssetVolume(left));
}
