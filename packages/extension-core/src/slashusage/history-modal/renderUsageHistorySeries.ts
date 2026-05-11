import { createSparkline } from "./createSparkline.js";
import { formatHistoryValue } from "./formatHistoryValue.js";
import type { UsageHistorySeries } from "./groupUsageHistoryRecords.js";

/**
 * Renders one usage history graph line.
 *
 * @param series Usage history series.
 * @param width Available content width.
 * @returns Rendered line.
 */
export function renderUsageHistorySeries(series: UsageHistorySeries, width: number): string {
  const latest = series.records.at(-1)!;
  const label = `${latest.provider} ${latest.label}`;
  const latestValue = formatHistoryValue(latest.value, latest.unit);
  const reserved = label.length + latestValue.length + 4;
  const sparkline = createSparkline(series.records.map((record) => record.value), Math.max(8, width - reserved));
  return `${label} ${sparkline} ${latestValue}`;
}
