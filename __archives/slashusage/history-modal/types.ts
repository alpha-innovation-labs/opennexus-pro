import type { UsageHistoryModelOption } from "./createUsageHistoryModelOptions.js";

/** Window filter option used by the usage history modal. */
export type UsageHistoryWindowOption = "5h" | "week";

/** Model and window filters applied to usage history. */
export type UsageHistoryFilters = {
  model: UsageHistoryModelOption;
  window: UsageHistoryWindowOption;
};
