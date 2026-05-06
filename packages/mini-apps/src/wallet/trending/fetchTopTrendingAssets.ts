import { parseTrendingAssets } from "./parseTrendingAssets.js";
import type { TrendingAsset } from "./TrendingAsset.js";

const TOP_TRENDING_URL = "https://datapi.jup.ag/v2/assets/toptrending/6h?includeSparklines=true";

/**
 * Fetches Jupiter 6-hour top-trending assets.
 *
 * @returns Top-trending assets.
 */
export async function fetchTopTrendingAssets(): Promise<TrendingAsset[]> {
	const response = await fetch(TOP_TRENDING_URL);
	if (!response.ok) throw new Error(`Jupiter trending fetch failed: ${response.status}`);
	return parseTrendingAssets(await response.json());
}
