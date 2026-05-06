import { createBrailleCanvas } from "../chart/createBrailleCanvas.js";
import { drawBrailleLine } from "../chart/drawBrailleLine.js";
import { renderBrailleCanvas } from "../chart/renderBrailleCanvas.js";
import type { TrendingSparklinePoint } from "./TrendingSparklinePoint.js";

/**
 * Creates a compact one-row braille line chart for trending prices.
 *
 * @param points Sparkline price points.
 * @param width Maximum chart width.
 * @returns Mini braille line chart text.
 */
export function createMiniLineChart(points: readonly TrendingSparklinePoint[] | undefined, width = 16): string {
	if (!points || points.length === 0) return "⠀".repeat(width);
	const sampled = points.slice(Math.max(0, points.length - width * 2));
	const values = sampled.map((point) => point.price);
	const min = Math.min(...values);
	const max = Math.max(...values);
	const canvas = createBrailleCanvas(width, 1);
	const pixelWidth = Math.max(1, width * 2 - 1);
	const pixelHeight = 3;
	const plotted = sampled.map((point, index) => ({
		x: Math.round((index / Math.max(1, sampled.length - 1)) * pixelWidth),
		y: Math.round(pixelHeight - ((point.price - min) / Math.max(0.000000001, max - min)) * pixelHeight),
	}));
	for (let index = 1; index < plotted.length; index += 1) drawBrailleLine(canvas, plotted[index - 1]!.x, plotted[index - 1]!.y, plotted[index]!.x, plotted[index]!.y);
	if (plotted.length === 1) drawBrailleLine(canvas, plotted[0]!.x, plotted[0]!.y, plotted[0]!.x, plotted[0]!.y);
	return renderBrailleCanvas(canvas)[0] ?? "⠀".repeat(width);
}
