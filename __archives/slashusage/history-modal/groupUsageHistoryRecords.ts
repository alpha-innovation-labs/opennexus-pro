import type { UsageHistoryRecord } from "../history/types.js";

/** Usage history records grouped as one graph series. */
export type UsageHistorySeries = {
  key: string;
  records: UsageHistoryRecord[];
};

/**
 * Groups usage history records by provider, label, model, and unit.
 *
 * @param records Usage history records.
 * @returns Grouped usage history series.
 */
export function groupUsageHistoryRecords(records: UsageHistoryRecord[]): UsageHistorySeries[] {
  const groups = new Map<string, UsageHistoryRecord[]>();
  for (const record of records) {
    const key = [record.provider, record.label, record.modelId ?? "all", record.unit].join("|");
    groups.set(key, [...(groups.get(key) ?? []), record]);
  }
  return [...groups.entries()].map(([key, grouped]) => ({ key, records: grouped.sort((left, right) => left.sampledAt - right.sampledAt) }));
}
