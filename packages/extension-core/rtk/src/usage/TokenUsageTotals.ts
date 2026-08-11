/**
 * Token usage totals collected from Nexus session logs.
 */
export interface TokenUsageTotals {
	cacheRead: number;
	cacheWrite: number;
	input: number;
	output: number;
	total: number;
}
