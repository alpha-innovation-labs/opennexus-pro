const DAY_MS = 86_400_000;

/**
 * Formats the Monday-start week key for a timestamp.
 *
 * @param date Timestamp to format.
 * @returns Week start date key.
 */
export function getWeekKey(date: Date): string {
  const utc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const day = date.getUTCDay() || 7;
  return new Date(utc - (day - 1) * DAY_MS).toISOString().slice(0, 10);
}
