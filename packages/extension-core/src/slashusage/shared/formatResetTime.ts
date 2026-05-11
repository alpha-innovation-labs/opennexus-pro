import { formatDuration } from "./formatDuration.js";

/**
 * Formats a future reset timestamp into a compact relative label.
 *
 * @param value ISO timestamp string.
 * @returns Relative reset label.
 */
export function formatResetTime(value: string): string {
	const resetAt = new Date(value).getTime();
	if (!Number.isFinite(resetAt)) return "";
	return formatDuration(Math.max(0, (resetAt - Date.now()) / 1000));
}
