import type { UsageHistoryWindowOption } from "./types.js";

/**
 * Creates fixed usage window filter options.
 *
 * @returns Usage window filter options.
 */
export function createUsageHistoryWindowOptions(): UsageHistoryWindowOption[] {
  return ["week", "5h"];
}
