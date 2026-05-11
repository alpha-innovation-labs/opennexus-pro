/**
 * Formats a startup duration as the compact startup hero timer badge.
 *
 * @param durationMs Startup duration in milliseconds.
 * @returns Timer badge formatted as seconds and centiseconds.
 */
export function formatStartupDurationBadge(durationMs: number): string {
	const safeDurationMs = Math.max(0, durationMs);
	const totalCentiseconds = Math.floor(safeDurationMs / 10);
	const seconds = Math.floor(totalCentiseconds / 100);
	const centiseconds = String(totalCentiseconds % 100).padStart(2, "0");
	return `[⏱ ${seconds}:${centiseconds}]`;
}
