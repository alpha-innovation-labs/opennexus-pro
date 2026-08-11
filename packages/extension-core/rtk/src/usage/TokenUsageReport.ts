import type { TokenUsagePeriod } from "./TokenUsagePeriod";
import type { TokenUsageTotals } from "./TokenUsageTotals";

/**
 * Token usage grouped by display periods.
 */
export interface TokenUsageReport {
	daily: TokenUsagePeriod[];
	monthly: TokenUsagePeriod[];
	mostUsedModel: string | null;
	summary: TokenUsageTotals;
	weekly: TokenUsagePeriod[];
}
