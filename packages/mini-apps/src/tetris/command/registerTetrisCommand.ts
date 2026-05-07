import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { withSlashMenuGroup } from "@nexus/extensions/neo-editor/features/menu/withSlashMenuGroup.js";
import { showTetrisModal } from "./showTetrisModal.js";

/**
 * Registers the /tetris mini-app slash command.
 *
 * @param pi Pi extension API.
 */
export function registerTetrisCommand(pi: ExtensionAPI): void {
	pi.registerCommand("tetris", withSlashMenuGroup({
		description: "Open the Tetris mini app",
		handler: async (_args, ctx) => {
			await showTetrisModal(ctx);
		},
	}, "Mini-Apps"));
}
