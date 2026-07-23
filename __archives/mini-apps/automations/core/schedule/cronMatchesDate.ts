import { normalizeWeekday } from "./normalizeWeekday.js";
import { parseCronField } from "./parseCronField.js";

/**
 * Checks whether a cron expression matches a date.
 *
 * @param cronExpression Five-field cron expression.
 * @param date Date to test.
 * @returns True when all cron fields match.
 */
export function cronMatchesDate(cronExpression: string, date: Date): boolean {
	const [minute, hour, day, month, weekday] = cronExpression.trim().split(/\s+/u);
	const weekdays = new Set([...parseCronField(weekday, 0, 7)].map(normalizeWeekday));
	return parseCronField(minute, 0, 59).has(date.getMinutes())
		&& parseCronField(hour, 0, 23).has(date.getHours())
		&& parseCronField(day, 1, 31).has(date.getDate())
		&& parseCronField(month, 1, 12).has(date.getMonth() + 1)
		&& weekdays.has(date.getDay());
}
