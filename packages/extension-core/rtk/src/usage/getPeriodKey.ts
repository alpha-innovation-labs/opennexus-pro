import type { RtkSavingsPeriodKey } from "../savings/RtkSavingsPeriodKey";
import { getWeekKey } from "./getWeekKey";

/**
 * Gets a grouping key for the selected period type.
 *
 * @param date Timestamp to group.
 * @param period Period type.
 * @returns Period key.
 */
export function getPeriodKey(date: Date, period: RtkSavingsPeriodKey): string {
  if (period === "daily") return date.toISOString().slice(0, 10);
  if (period === "weekly") return getWeekKey(date);
  return date.toISOString().slice(0, 7);
}
