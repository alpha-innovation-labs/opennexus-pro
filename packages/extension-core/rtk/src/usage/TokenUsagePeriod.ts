import type { TokenUsageTotals } from "./TokenUsageTotals";

/**
 * Aggregated token usage for a day, week, or month.
 */
export interface TokenUsagePeriod extends TokenUsageTotals {
	key: string;
	modelTokens: Record<string, number>;
}
