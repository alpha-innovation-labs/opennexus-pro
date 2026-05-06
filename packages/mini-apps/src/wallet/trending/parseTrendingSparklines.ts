import type { TrendingSparklinePoint } from "./TrendingSparklinePoint.js";

/**
 * Parses Jupiter trending sparklines keyed by mint.
 *
 * @param payload Unknown Jupiter response payload.
 * @returns Sparkline points keyed by mint.
 */
export function parseTrendingSparklines(payload: unknown): Record<string, TrendingSparklinePoint[]> {
	const raw = (payload as { sparklines?: unknown })?.sparklines;
	if (!raw || typeof raw !== "object") return {};
	const result: Record<string, TrendingSparklinePoint[]> = {};
	for (const [mint, value] of Object.entries(raw as Record<string, unknown>)) {
		const points = Array.isArray(value) ? value.flatMap((point) => {
			const row = point as Record<string, unknown>;
			const time = Number(row.time);
			const price = Number(row.price);
			return Number.isFinite(time) && Number.isFinite(price) ? [{ time, price }] : [];
		}) : [];
		if (points.length > 0) result[mint] = points;
	}
	return result;
}
