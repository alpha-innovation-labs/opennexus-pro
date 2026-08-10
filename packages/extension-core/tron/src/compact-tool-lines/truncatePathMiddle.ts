/**
 * Truncates a path in the middle.
 *
 * @param path Input path.
 * @param max Maximum output width.
 * @returns Truncated path.
 */
export function truncatePathMiddle(path: string, max = 72): string {
	if (!path || path.length <= max) return path;
	if (max <= 3) return path.slice(0, max);
	const keep = max - 1;
	const left = Math.ceil(keep / 2);
	const right = Math.floor(keep / 2);
	return `${path.slice(0, left)}…${path.slice(path.length - right)}`;
}
