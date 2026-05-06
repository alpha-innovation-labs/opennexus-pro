import { createTokenPriceChartLines } from "./createTokenPriceChartLines.js";
import { formatUsdPrice } from "./formatUsdPrice.js";
import { renderTokenPriceTimeAxis } from "./renderTokenPriceTimeAxis.js";
import type { TokenPriceCandle } from "./TokenPriceCandle.js";

/**
 * Renders token price candles as a usage-style line chart.
 *
 * @param label Token display label.
 * @param candles Price candles.
 * @param width Available width.
 * @param maxRows Available row budget.
 * @returns Chart lines.
 */
export function renderTokenPriceChart(label: string, candles: TokenPriceCandle[], width: number, maxRows: number): string[] {
	if (candles.length === 0) return [`${label} · no price history found`];
	const closes = candles.map((candle) => candle.close);
	const min = Math.min(...closes);
	const max = Math.max(...closes);
	const latest = closes.at(-1) ?? 0;
	const plotWidth = Math.max(12, width - 14);
	const chartHeight = Math.max(4, maxRows - 3);
	return [
		`${label} · 4h USD price · latest ${formatUsdPrice(latest)}`,
		...createTokenPriceChartLines(candles, plotWidth, chartHeight).map((row, index) => {
			const labelValue = index === 0 ? max : index === chartHeight - 1 ? min : undefined;
			return `${labelValue === undefined ? "         " : formatUsdPrice(labelValue).padStart(9)} │${row}`;
		}),
		renderTokenPriceTimeAxis(candles, plotWidth),
	];
}
