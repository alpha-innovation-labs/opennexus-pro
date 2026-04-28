import type { UsageHistoryUnit } from "../history/types.js";

/**
 * Formats a compact chart axis label.
 *
 * @param value Axis value.
 * @param unit Series unit.
 * @returns Padded axis label.
 */
export function formatAxisLabel(value: number, unit: UsageHistoryUnit): string {
  const text = unit === "usd" ? `$${value.toFixed(value >= 10 ? 0 : 1)}` : `${Math.round(value)}%`;
  return text.padStart(5, " ");
}
