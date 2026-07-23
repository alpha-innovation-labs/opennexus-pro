import { existsSync, readFileSync } from "node:fs";

/**
 * Reads and parses a JSON file when it exists.
 *
 * @param path File path.
 * @returns Parsed JSON object.
 */
export function readJsonFile(path: string): Record<string, unknown> | undefined {
	try {
		if (!existsSync(path)) return undefined;
		return JSON.parse(readFileSync(path, "utf-8")) as Record<string, unknown>;
	} catch {
		return undefined;
	}
}
