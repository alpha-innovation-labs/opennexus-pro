import { readFile } from "node:fs/promises";

/**
 * Reads one JSON file and returns undefined on missing or invalid content.
 *
 * @param path File path.
 * @returns Parsed JSON value.
 */
export async function readJson(path: string): Promise<unknown | undefined> {
	try {
		return JSON.parse(await readFile(path, "utf8"));
	} catch {
		return undefined;
	}
}
