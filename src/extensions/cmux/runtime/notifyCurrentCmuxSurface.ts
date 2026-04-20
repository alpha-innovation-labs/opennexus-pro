import { getCurrentCmuxRenameTarget } from "./getCurrentCmuxRenameTarget.js";
import { runCmuxCommand } from "./runCmuxCommand.js";

/**
 * Sends a completion notification for the current cmux surface.
 *
 * @param sessionTitle Current Nexus session title.
 * @returns True when cmux accepted the notification request.
 */
export async function notifyCurrentCmuxSurface(sessionTitle: string): Promise<boolean> {
	const target = getCurrentCmuxRenameTarget();
	if (!target.surfaceId) return false;

	const title = sessionTitle.replace(/\s+/g, " ").trim() || "Untitled session";
	const args = ["notify", "--title", title, "--subtitle", "Nexus pane done"];
	if (target.workspaceId) args.push("--workspace", target.workspaceId);
	args.push("--surface", target.surfaceId);
	return runCmuxCommand(args);
}
