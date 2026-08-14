import type {
	ExtensionAPI,
	ExtensionCommandContext,
} from "@earendil-works/pi-coding-agent";
import { withSlashMenuGroup } from "@extensions/shared";
import { showCmuxWorkspaceShellsModal } from "./showCmuxWorkspaceShellsModal";

/**
 * Registers the /cmux workspace shell command.
 *
 * @param pi Pi extension API.
 */
export function registerCmuxCommand(pi: ExtensionAPI): void {
	pi.registerCommand(
		"cmux",
		withSlashMenuGroup(
			{
				description: "Show cmux workspaces and Nexus session ids",
				handler: async (_args: string, ctx: ExtensionCommandContext) => {
					await showCmuxWorkspaceShellsModal(ctx);
				},
			},
			"Extensions",
		),
	);
}
