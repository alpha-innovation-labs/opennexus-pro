import type { TokenUsagePeriod } from "./TokenUsagePeriod";
import { addTokenUsageTotals } from "./addTokenUsageTotals";
import { createTokenUsagePeriod } from "./createTokenUsagePeriod";

/**
 * Aggregates token usage rows into one combined period.
 *
 * @param key Combined period key.
 * @param periods Usage periods to sum.
 * @returns Aggregated token usage period, or undefined when there are no rows.
 */
export function aggregateTokenUsagePeriods(key: string, periods: TokenUsagePeriod[]): TokenUsagePeriod | undefined {
  if (periods.length === 0) return undefined;
  const aggregate = createTokenUsagePeriod(key);
  for (const period of periods) {
    addTokenUsageTotals(aggregate, period);
    for (const [model, tokens] of Object.entries(period.modelTokens)) aggregate.modelTokens[model] = (aggregate.modelTokens[model] ?? 0) + tokens;
  }
  return aggregate;
}
