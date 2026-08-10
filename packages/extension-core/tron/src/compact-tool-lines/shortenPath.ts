import { homedir } from "node:os";
import { truncatePathFromStart } from "./truncatePathFromStart";

/**
 * Shortens a path and replaces the home prefix with `~`.
 *
 * @param path Input path.
 * @returns Shortened path.
 */
export function shortenPath(path: string): string {
	const home = homedir();
	const normalized = path.startsWith(home) ? `~${path.slice(home.length)}` : path;
	return truncatePathFromStart(normalized, 72);
}
