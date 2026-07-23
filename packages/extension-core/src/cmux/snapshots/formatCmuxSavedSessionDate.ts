/**
 * Formats a saved cmux session timestamp for display.
 *
 * @param timestamp ISO timestamp.
 * @returns Compact local timestamp.
 */
export function formatCmuxSavedSessionDate(timestamp: string): string {
	const date = new Date(timestamp);
	if (Number.isNaN(date.getTime())) return timestamp;
	return date.toLocaleString();
}
