import { createMiniLineChart } from "./createMiniLineChart.js";
import { formatCompactNumber } from "./formatCompactNumber.js";
import { formatTrendingPercent } from "./formatTrendingPercent.js";
import { formatTrendingPrice } from "./formatTrendingPrice.js";
import { getTrendingAssetVolume } from "./getTrendingAssetVolume.js";
import { padTableCell } from "./padTableCell.js";
import type { TrendingAsset } from "./TrendingAsset.js";

/**
 * Formats one trending asset table row.
 *
 * @param asset Trending asset.
 * @param index Row index.
 * @param selected Whether the row is selected.
 * @returns Table row text.
 */
export function formatTrendingAssetRow(asset: TrendingAsset, index: number, selected = false): string {
	return [
		padTableCell(selected ? "›" : String(index + 1), 3, "right"),
		padTableCell(asset.symbol || asset.name || asset.id, 14),
		padTableCell(formatTrendingPrice(asset.usdPrice), 11, "right"),
		padTableCell(formatTrendingPercent(asset.stats6h?.priceChange), 9, "right"),
		padTableCell(createMiniLineChart(asset.sparkline, 16), 16),
		padTableCell(formatCompactNumber(getTrendingAssetVolume(asset)), 9, "right"),
		padTableCell(formatCompactNumber(asset.liquidity), 9, "right"),
		padTableCell(formatCompactNumber(asset.mcap), 9, "right"),
		padTableCell(formatCompactNumber(asset.stats6h?.numTraders), 8, "right"),
	].join(" ");
}
