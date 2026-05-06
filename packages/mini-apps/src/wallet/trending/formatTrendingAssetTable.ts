import { formatTrendingAssetRow } from "./formatTrendingAssetRow.js";
import { padTableCell } from "./padTableCell.js";
import { sortTrendingAssetsByVolume } from "./sortTrendingAssetsByVolume.js";
import type { TrendingAsset } from "./TrendingAsset.js";

/**
 * Formats Jupiter top-trending assets as a terminal table sorted by volume.
 *
 * @param assets Trending assets.
 * @param selectedIndex Selected row index after sorting.
 * @returns Table lines.
 */
export function formatTrendingAssetTable(assets: TrendingAsset[], selectedIndex = -1): string[] {
	if (assets.length === 0) return ["No trending assets returned."];
	const header = [padTableCell("#", 3), padTableCell("Token", 14), padTableCell("Price", 11, "right"), padTableCell("6h", 9, "right"), padTableCell("Line", 16), padTableCell("Vol", 9, "right"), padTableCell("Liq", 9, "right"), padTableCell("MCap", 9, "right"), padTableCell("Traders", 8, "right")].join(" ");
	const divider = "─".repeat(header.length);
	const rows = sortTrendingAssetsByVolume(assets).slice(0, 50).map((asset, index) => formatTrendingAssetRow(asset, index, index === selectedIndex));
	return [header, divider, ...rows];
}
