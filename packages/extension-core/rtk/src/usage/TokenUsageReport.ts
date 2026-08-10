import type { TokenUsagePeriod } from "./TokenUsagePeriod.js";
import type { TokenUsageTotals } from "./TokenUsageTotals.js";

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
