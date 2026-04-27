const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/**
 * Formats one todo timestamp as a compact relative age.
 *
 * @param timestamp Unix timestamp in milliseconds.
 * @returns Relative age like 2m, 3h, or 4d.
 */
export function formatTodoAge(timestamp: number): string {
	const ageMs = Math.max(0, Date.now() - timestamp);
	if (ageMs < HOUR_MS) return `${Math.floor(ageMs / MINUTE_MS)}m`;
	if (ageMs < DAY_MS) return `${Math.floor(ageMs / HOUR_MS)}h`;
	return `${Math.floor(ageMs / DAY_MS)}d`;
}
