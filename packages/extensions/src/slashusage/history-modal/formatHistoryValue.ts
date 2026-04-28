import type { UsageHistoryUnit } from "../history/types.js";

/**
 * Formats one historical usage value.
 *
 * @param value Usage value.
 * @param unit Usage value unit.
 * @returns Display value.
 */
export function formatHistoryValue(value: number, unit: UsageHistoryUnit): string {
  if (unit === "usd") return `$${value.toFixed(2)}`;
  return `${Math.round(value)}%`;
}
