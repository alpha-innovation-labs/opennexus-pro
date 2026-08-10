import { formatClockTime } from "./formatClockTime";
import { formatDate } from "./formatDate";
import { isWithinPastDay } from "./isWithinPastDay";
import { toDate } from "./toDate";

/**
 * Formats the timestamp shown on the bottom-right user-message border.
 *
 * @param timestamp Message timestamp.
 * @param now Current time reference.
 * @returns Time-only label for recent messages, otherwise time and date.
 */
export function formatUserMessageTime(timestamp: Date | number | string | undefined, now = new Date()): string {
  const date = toDate(timestamp);
  if (!date) return "";
  const time = formatClockTime(date);
  return isWithinPastDay(date, now) ? time : `${time} · ${formatDate(date)}`;
}
