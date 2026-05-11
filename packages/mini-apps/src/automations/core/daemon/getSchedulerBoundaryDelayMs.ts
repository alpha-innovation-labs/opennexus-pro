/**
 * Calculates the delay until the next wall-clock scheduler boundary.
 *
 * @param now Current time used as the scheduling reference.
 * @param intervalMs Boundary interval in milliseconds.
 * @returns Milliseconds until the next boundary.
 */
export function getSchedulerBoundaryDelayMs(now: Date, intervalMs: number): number {
	if (!Number.isFinite(intervalMs) || intervalMs <= 0) return 60_000;
	const remainder = now.getTime() % intervalMs;
	return remainder === 0 ? intervalMs : intervalMs - remainder;
}
