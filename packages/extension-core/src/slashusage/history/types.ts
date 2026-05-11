import type { ProviderName } from "../types.js";

/** Unit used by one historical usage metric. */
export type UsageHistoryUnit = "percent" | "usd";

/** One append-only usage history sample. */
export type UsageHistoryRecord = {
  error?: string;
  fetchedAt: number;
  label: string;
  modelId?: string;
  provider: ProviderName;
  resetAt?: string;
  sampledAt: number;
  unit: UsageHistoryUnit;
  value: number;
};
