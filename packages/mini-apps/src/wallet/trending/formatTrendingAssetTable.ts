import { formatCompactNumber } from "./formatCompactNumber.js";
import { formatTrendingPercent } from "./formatTrendingPercent.js";
import { formatTrendingPrice } from "./formatTrendingPrice.js";
import { padTableCell } from "./padTableCell.js";
import type { TrendingAsset } from "./TrendingAsset.js";

/**
 * Formats Jupiter top-trending assets as a terminal table.
 *
 * @param assets Trending assets.
 * @returns Table lines.
 */
export function formatTrendingAssetTable(assets: TrendingAsset[]): string[] {
	if (assets.length === 0) return ["No trending assets returned."];
	const header = [padTableCell("#", 3), padTableCell("Token", 14), padTableCell("Price", 11, "right"), padTableCell("6h", 9, "right"), padTableCell("Liq", 9, "right"), padTableCell("MCap", 9, "right"), padTableCell("Traders", 8, "right")].join(" ");
	const divider = "─".repeat(header.length);
	const rows = assets.slice(0, 50).map((asset, index) => [
		padTableCell(String(index + 1), 3, "right"),
		padTableCell(asset.symbol || asset.name || asset.id, 14),
		padTableCell(formatTrendingPrice(asset.usdPrice), 11, "right"),
		padTableCell(formatTrendingPercent(asset.stats6h?.priceChange), 9, "right"),
		padTableCell(formatCompactNumber(asset.liquidity), 9, "right"),
		padTableCell(formatCompactNumber(asset.mcap), 9, "right"),
		padTableCell(formatCompactNumber(asset.stats6h?.numTraders), 8, "right"),
	].join(" "));
	return [header, divider, ...rows];
}
