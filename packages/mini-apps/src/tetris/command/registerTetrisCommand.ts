import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { withSlashMenuGroup } from "@nexus/extensions/slash-menu/withSlashMenuGroup.js";
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
