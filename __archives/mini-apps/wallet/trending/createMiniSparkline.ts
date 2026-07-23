import type { TrendingSparklinePoint } from "./TrendingSparklinePoint.js";

const SPARKLINE_BLOCKS = "▁▂▃▄▅▆▇█";

/**
 * Creates a compact one-line sparkline for trending prices.
 *
 * @param points Sparkline price points.
 * @param width Maximum sparkline width.
 * @returns Sparkline text.
 */
export function createMiniSparkline(points: readonly TrendingSparklinePoint[] | undefined, width = 16): string {
	if (!points || points.length === 0) return "-".repeat(width);
	const sampled = points.slice(Math.max(0, points.length - width));
	const values = sampled.map((point) => point.price);
	const min = Math.min(...values);
	const max = Math.max(...values);
	return sampled.map((point) => {
		const ratio = (point.price - min) / Math.max(0.000000001, max - min);
		return SPARKLINE_BLOCKS[Math.round(ratio * (SPARKLINE_BLOCKS.length - 1))] ?? "▁";
	}).join("").padStart(width, " ");
}
