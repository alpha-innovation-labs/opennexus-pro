import type { UsageHistoryRecord } from "./types.js";

/**
 * Averages a non-empty bucket of usage history records.
 *
 * @param records Usage history records from the same series.
 * @returns Averaged usage history record.
 */
export function averageUsageHistoryRecords(records: UsageHistoryRecord[]): UsageHistoryRecord {
  const base = records[Math.floor(records.length / 2)]!;
  const latest = records[records.length - 1]!;
  const averageValue = records.reduce((sum, record) => sum + record.value, 0) / records.length;
  const averageSampledAt = records.reduce((sum, record) => sum + record.sampledAt, 0) / records.length;
  const averageFetchedAt = records.reduce((sum, record) => sum + record.fetchedAt, 0) / records.length;

  return {
    fetchedAt: Math.round(averageFetchedAt),
    label: base.label,
    ...(base.modelId ? { modelId: base.modelId } : {}),
    provider: base.provider,
    ...(latest.resetAt ? { resetAt: latest.resetAt } : {}),
    ...(latest.error ? { error: latest.error } : {}),
    sampledAt: Math.round(averageSampledAt),
    unit: base.unit,
    value: Number(averageValue.toFixed(4)),
  };
}
