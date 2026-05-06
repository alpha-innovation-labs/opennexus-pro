import { createJupiterChartUrl } from "./createJupiterChartUrl.js";
import { parseJupiterChartCandles } from "./parseJupiterChartCandles.js";
import type { TokenPriceCandle } from "./TokenPriceCandle.js";

/**
 * Fetches 4-hour USD price candles for a token mint from Jupiter.
 *
 * @param mint Token mint address.
 * @param candles Number of 4-hour candles.
 * @param to Unix timestamp in milliseconds.
 * @returns Token price candles.
 */
export async function fetchTokenPriceCandles(mint: string, candles = 100, to = Date.now()): Promise<TokenPriceCandle[]> {
	const response = await fetch(createJupiterChartUrl(mint, to, candles));
	if (!response.ok) throw new Error(`Jupiter chart fetch failed: ${response.status}`);
	return parseJupiterChartCandles(await response.json());
}
