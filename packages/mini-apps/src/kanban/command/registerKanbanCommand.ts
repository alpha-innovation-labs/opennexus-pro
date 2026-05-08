import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { withSlashMenuGroup } from "@nexus/extensions/slash-menu/withSlashMenuGroup.js";
import { showKanbanModal } from "./showKanbanModal.js";

/**
 * Registers the temporary kanban command.
 *
 * @param pi Pi extension API.
 */
export function registerKanbanCommand(pi: ExtensionAPI): void {
	pi.registerCommand("kanban", withSlashMenuGroup({
		description: "Open the temporary kanban board",
		handler: async (_args, ctx) => {
			await showKanbanModal(ctx);
		},
	}, "Mini-Apps"));
}
