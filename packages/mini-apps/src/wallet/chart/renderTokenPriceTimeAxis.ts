import { formatChartTime } from "./formatChartTime.js";
import type { TokenPriceCandle } from "./TokenPriceCandle.js";

/**
 * Renders start and end time labels for a token price chart.
 *
 * @param candles Price candles in chronological order.
 * @param plotWidth Chart plot width.
 * @returns Time axis line.
 */
export function renderTokenPriceTimeAxis(candles: TokenPriceCandle[], plotWidth: number): string {
	const first = candles[0];
	const last = candles.at(-1);
	if (!first || !last) return "";
	const start = formatChartTime(first.time);
	const end = formatChartTime(last.time);
	return `${" ".repeat(10)}${start}${" ".repeat(Math.max(1, plotWidth - start.length - end.length))}${end}`;
}
