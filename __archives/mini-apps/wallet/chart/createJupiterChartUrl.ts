/**
 * Creates the Jupiter Data API chart URL for 4-hour USD token prices.
 *
 * @param mint Token mint address.
 * @param to Unix timestamp in milliseconds.
 * @param candles Number of 4-hour candles.
 * @returns Jupiter chart URL.
 */
export function createJupiterChartUrl(mint: string, to: number, candles: number): string {
	const encodedMint = encodeURIComponent(mint);
	return `https://datapi.jup.ag/v2/charts/${encodedMint}?interval=4_HOUR&to=${to}&candles=${candles}&type=price&quote=usd`;
}
