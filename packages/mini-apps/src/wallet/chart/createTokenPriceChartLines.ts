import { createBrailleCanvas } from "./createBrailleCanvas.js";
import { drawBrailleLine } from "./drawBrailleLine.js";
import { renderBrailleCanvas } from "./renderBrailleCanvas.js";
import type { TokenPriceCandle } from "./TokenPriceCandle.js";

/**
 * Creates a dense braille line chart for token close prices.
 *
 * @param candles Price candles in chronological order.
 * @param width Chart width in terminal cells.
 * @param height Chart height in terminal rows.
 * @returns Braille chart rows.
 */
export function createTokenPriceChartLines(candles: TokenPriceCandle[], width: number, height: number): string[] {
	if (candles.length === 0) return ["No price candles available."];
	const values = candles.map((candle) => candle.close);
	const min = Math.min(...values);
	const max = Math.max(...values);
	const canvas = createBrailleCanvas(width, height);
	const pixelWidth = Math.max(1, width * 2 - 1);
	const pixelHeight = Math.max(1, height * 4 - 1);
	const points = values.map((value, index) => ({
		x: Math.round((index / Math.max(1, values.length - 1)) * pixelWidth),
		y: Math.round(pixelHeight - ((value - min) / Math.max(0.000000001, max - min)) * pixelHeight),
	}));
	for (let index = 1; index < points.length; index += 1) drawBrailleLine(canvas, points[index - 1]!.x, points[index - 1]!.y, points[index]!.x, points[index]!.y);
	if (points.length === 1) drawBrailleLine(canvas, points[0]!.x, points[0]!.y, points[0]!.x, points[0]!.y);
	return renderBrailleCanvas(canvas);
}
