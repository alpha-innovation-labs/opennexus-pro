import { homedir } from "node:os";
import { resolve } from "node:path";

/**
 * Expands leading `~` segments in a path-like query.
 *
 * @param value Raw path-like query.
 * @returns Expanded path query.
 */
export function expandHomePath(value: string): string {
	if (value === "~") return homedir();
	if (value.startsWith("~/")) return resolve(homedir(), value.slice(2));
	return value;
}
