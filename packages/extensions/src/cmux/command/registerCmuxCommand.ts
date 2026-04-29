import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { withSlashMenuGroup } from "../../neo-editor/features/menu/withSlashMenuGroup.js";
import { showCmuxWorkspaceShellsModal } from "./showCmuxWorkspaceShellsModal.js";

/**
 * Registers the /cmux workspace shell command.
 *
 * @param pi Pi extension API.
 */
export function registerCmuxCommand(pi: ExtensionAPI): void {
	pi.registerCommand("cmux", withSlashMenuGroup({
		description: "Show cmux workspaces and Nexus session ids",
		handler: async (_args, ctx) => {
			await showCmuxWorkspaceShellsModal(ctx);
		},
	}, "Extensions"));
}
