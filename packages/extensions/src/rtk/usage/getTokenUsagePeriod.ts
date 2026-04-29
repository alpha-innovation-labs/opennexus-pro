import type { RtkSavingsPeriodKey } from "../savings/RtkSavingsPeriodKey.js";
import type { TokenUsagePeriod } from "./TokenUsagePeriod.js";
import type { TokenUsageReport } from "./TokenUsageReport.js";

/**
 * Gets the latest token usage period for a selected period key.
 *
 * @param report Token usage report.
 * @param period Selected period key.
 * @returns Latest usage period.
 */
export function getTokenUsagePeriod(report: TokenUsageReport, period: RtkSavingsPeriodKey): TokenUsagePeriod | undefined {
  const rows = report[period];
  return rows[rows.length - 1];
}
