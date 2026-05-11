import { cronMatchesDate } from "./cronMatchesDate.js";

/**
 * Finds the next time a cron expression should run.
 *
 * @param cronExpression Five-field cron expression.
 * @param after Date after which to search.
 * @returns Next matching date.
 */
export function getNextRunAt(cronExpression: string, after: Date = new Date()): Date {
	const candidate = new Date(after.getTime());
	candidate.setSeconds(0, 0);
	candidate.setMinutes(candidate.getMinutes() + 1);
	for (let index = 0; index < 366 * 24 * 60; index += 1) {
		if (cronMatchesDate(cronExpression, candidate)) return candidate;
		candidate.setMinutes(candidate.getMinutes() + 1);
	}
	throw new Error("Unable to find next run within one year");
}
