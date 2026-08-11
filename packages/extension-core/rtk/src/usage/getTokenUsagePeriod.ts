import type { RtkSavingsPeriodKey } from "../savings/RtkSavingsPeriodKey";
import { getRollingTokenUsagePeriod } from "./getRollingTokenUsagePeriod";
import type { TokenUsagePeriod } from "./TokenUsagePeriod";
import type { TokenUsageReport } from "./TokenUsageReport";

/**
 * Gets the latest token usage period for a selected period key.
 *
 * @param report Token usage report.
 * @param period Selected period key.
 * @returns Latest usage period.
 */
export function getTokenUsagePeriod(
	report: TokenUsageReport,
	period: RtkSavingsPeriodKey,
): TokenUsagePeriod | undefined {
	if (period === "monthly")
		return (
			getRollingTokenUsagePeriod(report.daily, 30) ?? report.monthly.at(-1)
		);
	const rows = report[period];
	return rows[rows.length - 1];
}
