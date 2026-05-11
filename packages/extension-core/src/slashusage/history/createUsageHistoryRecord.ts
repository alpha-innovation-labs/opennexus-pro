import type { ProviderModel, RateWindow, UsageSnapshot } from "../types.js";
import type { UsageHistoryRecord, UsageHistoryUnit } from "./types.js";

/**
 * Creates historical records for every metric in a usage snapshot.
 *
 * @param snapshot Current provider usage snapshot.
 * @param model Current model metadata.
 * @param sampledAt Sampling time.
 * @returns Append-ready usage history records.
 */
export function createUsageHistoryRecords(snapshot: UsageSnapshot, model: ProviderModel, sampledAt = Date.now()): UsageHistoryRecord[] {
  return snapshot.windows.flatMap((window) => {
    const metric = extractWindowMetric(window);
    if (!metric) return [];
    return [{
      ...(snapshot.error ? { error: snapshot.error } : {}),
      fetchedAt: snapshot.fetchedAt,
      label: window.label,
      ...(model?.id ? { modelId: model.id } : {}),
      provider: snapshot.provider,
      ...(window.resetAt ? { resetAt: window.resetAt } : {}),
      sampledAt,
      unit: metric.unit,
      value: metric.value,
    }];
  });
}

/**
 * Extracts the canonical historical metric from one rate window.
 *
 * @param window Usage rate window.
 * @returns Historical metric, if available.
 */
function extractWindowMetric(window: RateWindow): { unit: UsageHistoryUnit; value: number } | undefined {
  const amount = (window as RateWindow & { usedAmountUsd?: unknown }).usedAmountUsd;
  if (typeof amount === "number" && Number.isFinite(amount)) return { unit: "usd", value: amount };
  if (typeof window.usedPercent === "number" && Number.isFinite(window.usedPercent)) return { unit: "percent", value: window.usedPercent };
  return undefined;
}
