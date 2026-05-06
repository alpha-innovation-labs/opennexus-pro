import type { TokenPriceCandle } from "./TokenPriceCandle.js";

/**
 * Parses Jupiter chart API payloads into normalized candles.
 *
 * @param payload Unknown Jupiter response payload.
 * @returns Normalized token price candles.
 */
export function parseJupiterChartCandles(payload: unknown): TokenPriceCandle[] {
	const source = Array.isArray(payload) ? payload : Array.isArray((payload as { candles?: unknown })?.candles) ? (payload as { candles: unknown[] }).candles : [];
	return source.flatMap((item) => {
		const row = item as Record<string, unknown>;
		const time = Number(row.time ?? row.t ?? row.timestamp ?? row.startTime);
		const open = Number(row.open ?? row.o);
		const high = Number(row.high ?? row.h ?? open);
		const low = Number(row.low ?? row.l ?? open);
		const close = Number(row.close ?? row.c ?? row.price ?? open);
		return [time, open, high, low, close].every(Number.isFinite) ? [{ time, open, high, low, close }] : [];
	});
}
