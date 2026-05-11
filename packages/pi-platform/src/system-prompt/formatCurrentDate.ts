/**
 * Formats the current local date using Pi's YYYY-MM-DD prompt format.
 *
 * @returns Local date string.
 */
export function formatCurrentDate(): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}
