import { spawn } from "node:child_process";
import { getCurrentCmuxRenameTarget } from "./getCurrentCmuxRenameTarget.js";
import { getCmuxExecutablePath } from "./getCmuxExecutablePath.js";

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

	return new Promise<boolean>((resolve) => {
		const child = spawn(getCmuxExecutablePath(), args, {
			stdio: "ignore",
		});
		child.once("error", () => resolve(false));
		child.once("close", (code) => resolve(code === 0));
	});
}
