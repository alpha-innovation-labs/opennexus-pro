import { assertCronExpression } from "./assertCronExpression.js";
import { parseHourText } from "./parseHourText.js";

/**
 * Converts cron or friendly schedule text into a cron expression.
 *
 * @param scheduleText User-facing schedule text.
 * @returns Normalized five-field cron expression.
 */
export function normalizeSchedule(scheduleText: string): string {
	const text = scheduleText.trim().toLowerCase();
	const cronCandidate = scheduleText.trim();
	if (cronCandidate.split(/\s+/u).length === 5) {
		assertCronExpression(cronCandidate);
		return cronCandidate;
	}
	if (text === "hourly") return "0 * * * *";
	if (text === "daily") return "0 9 * * *";
	const everyMatch = text.match(/^every\s+(\d+)\s*(m|min|mins|minute|minutes|h|hr|hour|hours)$/u);
	if (everyMatch) {
		const interval = Number(everyMatch[1]);
		if (everyMatch[2].startsWith("h")) {
			if (interval < 1 || interval > 23) throw new Error(`Unsupported hour interval: ${scheduleText}`);
			return `0 */${interval} * * *`;
		}
		if (interval < 1 || interval > 59) throw new Error(`Unsupported minute interval: ${scheduleText}`);
		return `*/${interval} * * * *`;
	}
	const weekdayMatch = text.match(/^weekdays\s+at\s+(.+)$/u);
	if (weekdayMatch) {
		const time = parseHourText(weekdayMatch[1]);
		return `${time.minute} ${time.hour} * * 1-5`;
	}
	const dailyMatch = text.match(/^daily\s+at\s+(.+)$/u);
	if (dailyMatch) {
		const time = parseHourText(dailyMatch[1]);
		return `${time.minute} ${time.hour} * * *`;
	}
	throw new Error(`Unsupported schedule: ${scheduleText}`);
}
