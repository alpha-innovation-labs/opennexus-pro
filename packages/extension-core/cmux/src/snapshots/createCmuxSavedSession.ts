import { createCmuxSavedSessionId } from "./createCmuxSavedSessionId";
import type { CmuxSavedSession, CmuxSavedWorkspace } from "./types";

/**
 * Creates a saved cmux session snapshot object.
 *
 * @param name User-visible snapshot name.
 * @param lines Saved workspace/pane preview lines.
 * @param workspaces Structured workspaces with session ids.
 * @returns Saved cmux session snapshot.
 */
export function createCmuxSavedSession(
	name: string,
	lines: string[],
	workspaces?: CmuxSavedWorkspace[],
): CmuxSavedSession {
	return {
		id: createCmuxSavedSessionId(),
		name,
		createdAt: new Date().toISOString(),
		lines,
		workspaces,
	};
}
