import { existsSync, readFileSync } from "node:fs";

/**
 * Reads full UTF-8 text from a file path when available.
 *
 * @param path File path to read.
 * @returns File content when readable, otherwise undefined.
 */
export function readTextFile(path: string): string | undefined {
	if (!existsSync(path)) return undefined;
	try {
		return readFileSync(path, "utf8");
	} catch {
		return undefined;
	}
}
