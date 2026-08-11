import { readFile } from "node:fs/promises";
import { createEmptyCmuxSavedSessionStore } from "./createEmptyCmuxSavedSessionStore";
import type { CmuxSavedSessionStore } from "./types";

/**
 * Reads saved cmux sessions from disk.
 *
 * @param storePath Saved-session store path.
 * @returns Parsed saved-session store.
 */
export async function readCmuxSavedSessionStore(
	storePath: string,
): Promise<CmuxSavedSessionStore> {
	try {
		const value = JSON.parse(
			await readFile(storePath, "utf8"),
		) as Partial<CmuxSavedSessionStore>;
		if (!Array.isArray(value.sessions))
			return createEmptyCmuxSavedSessionStore();
		return {
			version: 1,
			sessions: value.sessions.filter(
				(session) =>
					typeof session?.id === "string" &&
					typeof session.name === "string" &&
					Array.isArray(session.lines),
			),
		};
	} catch {
		return createEmptyCmuxSavedSessionStore();
	}
}
