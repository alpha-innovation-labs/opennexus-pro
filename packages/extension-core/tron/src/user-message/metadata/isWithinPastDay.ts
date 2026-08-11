const DAY_IN_MS = 24 * 60 * 60 * 1000;

/**
 * Checks whether a timestamp is within the previous 24 hours.
 *
 * @param timestamp Message timestamp.
 * @param now Current time reference.
 * @returns True when timestamp is not older than 24 hours.
 */
export function isWithinPastDay(timestamp: Date, now: Date): boolean {
	const age = now.getTime() - timestamp.getTime();
	return age >= 0 && age <= DAY_IN_MS;
}
