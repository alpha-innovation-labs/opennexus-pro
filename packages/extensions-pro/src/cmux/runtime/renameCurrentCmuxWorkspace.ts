import { getCurrentCmuxRenameTarget } from "./getCurrentCmuxRenameTarget.js";
import { runCmuxCommand } from "./runCmuxCommand.js";

/**
 * Renames the current cmux workspace title.
 *
 * @param title New workspace title.
 * @returns True when cmux accepted the rename request.
 */
export async function renameCurrentCmuxWorkspace(title: string): Promise<boolean> {
	const target = getCurrentCmuxRenameTarget();
	if (!target.workspaceId) return false;

	return runCmuxCommand(["workspace-action", "--action", "rename", "--workspace", target.workspaceId, "--title", title]);
}
