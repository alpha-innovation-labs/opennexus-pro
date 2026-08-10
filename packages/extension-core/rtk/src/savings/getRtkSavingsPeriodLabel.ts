import type { RtkSavingsPeriodKey } from "./RtkSavingsPeriodKey.js";

/**
 * Gets a user-facing label for an RTK savings period.
 *
 * @param period Period key.
 * @returns Display label.
 */
export function getRtkSavingsPeriodLabel(period: RtkSavingsPeriodKey): string {
  if (period === "daily") return "Daily";
  if (period === "weekly") return "Weekly";
  return "30 days";
}
