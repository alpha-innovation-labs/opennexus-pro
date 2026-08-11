import type { CmuxSavedSessionStore } from "./types";

/**
 * Creates an empty cmux saved-session store.
 *
 * @returns Empty saved-session store.
 */
export function createEmptyCmuxSavedSessionStore(): CmuxSavedSessionStore {
	return { version: 1, sessions: [] };
}
