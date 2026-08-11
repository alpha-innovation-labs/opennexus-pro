import { readdir } from "node:fs/promises";
import { join } from "node:path";
import type { DeleteSessionMatch } from "./DeleteSessionMatch";
import { getSessionIdFromSessionFileName } from "./getSessionIdFromSessionFileName";

/**
 * Lists session files in one directory using filenames only.
 *
 * @param dir Session directory to inspect.
 * @returns Filename-derived session matches.
 */
export async function listSessionFileMatchesInDir(
	dir: string,
): Promise<DeleteSessionMatch[]> {
	let entries: string[];
	try {
		entries = await readdir(dir);
	} catch {
		return [];
	}

	const matches: DeleteSessionMatch[] = [];
	for (const entry of entries) {
		const id = getSessionIdFromSessionFileName(entry);
		if (!id) continue;
		matches.push({ id, path: join(dir, entry) });
	}
	return matches;
}
