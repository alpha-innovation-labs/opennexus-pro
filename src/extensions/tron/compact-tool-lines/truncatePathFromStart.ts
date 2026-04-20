import { truncateFromStart } from "./truncateFromStart.ts";

/**
 * Truncates a path from the start and keeps the tail visible.
 *
 * @param path Input path.
 * @param max Maximum output width.
 * @returns Start-truncated path.
 */
export function truncatePathFromStart(path: string, max = 72): string {
	if (!path) return path;
	return truncateFromStart(path, max);
}
