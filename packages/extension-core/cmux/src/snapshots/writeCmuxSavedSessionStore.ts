import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { CmuxSavedSessionStore } from "./types";

/**
 * Writes saved cmux sessions to disk.
 *
 * @param storePath Saved-session store path.
 * @param store Saved-session store contents.
 */
export async function writeCmuxSavedSessionStore(
	storePath: string,
	store: CmuxSavedSessionStore,
): Promise<void> {
	await mkdir(dirname(storePath), { recursive: true });
	await writeFile(storePath, `${JSON.stringify(store, null, 2)}\n`, {
		encoding: "utf8",
		mode: 0o600,
	});
}
