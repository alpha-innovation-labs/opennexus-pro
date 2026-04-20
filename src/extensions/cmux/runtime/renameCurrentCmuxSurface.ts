import { getCurrentCmuxRenameTarget } from "./getCurrentCmuxRenameTarget.js";
import { runCmuxCommand } from "./runCmuxCommand.js";

/**
 * Renames the current cmux surface title.
 *
 * @param title New surface title.
 * @returns True when cmux accepted the rename request.
 */
export async function renameCurrentCmuxSurface(title: string): Promise<boolean> {
	const target = getCurrentCmuxRenameTarget();
	if (!target.surfaceId) return false;

	const args = ["rename-tab"];
	if (target.workspaceId) args.push("--workspace", target.workspaceId);
	args.push("--surface", target.surfaceId, "--title", title);

	return runCmuxCommand(args);
}
