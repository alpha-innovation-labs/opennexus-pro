import type { CmuxWorkspace } from "./types.js";

/**
 * Gets the most stable identifier available for a cmux workspace.
 *
 * @param workspace cmux workspace.
 * @returns Workspace UUID when present, otherwise the ref.
 */
export function getCmuxWorkspaceIdentifier(workspace: CmuxWorkspace): string {
	return workspace.id || workspace.ref;
}
