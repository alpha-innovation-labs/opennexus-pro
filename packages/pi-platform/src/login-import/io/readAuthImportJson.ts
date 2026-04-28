import { readFile } from "node:fs/promises";

/**
 * Reads and parses an auth import JSON file.
 *
 * @param authPath Absolute auth file path.
 * @returns Parsed JSON value from the auth file.
 */
export async function readAuthImportJson(authPath: string): Promise<unknown> {
	const content = await readFile(authPath, "utf8");
	return JSON.parse(content) as unknown;
}
