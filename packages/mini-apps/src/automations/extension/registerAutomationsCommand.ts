import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { withSlashMenuGroup } from "@nexus/extensions/slash-menu/withSlashMenuGroup.js";
import { showAutomationsModal } from "../modal/showAutomationsModal.js";

/**
 * Registers the /automations mini-app slash command.
 *
 * @param pi Extension API.
 */
export function registerAutomationsCommand(pi: ExtensionAPI): void {
	pi.registerCommand("automations", withSlashMenuGroup({
		description: "Browse and edit scheduled prompt automations",
		handler: async (_args, ctx) => showAutomationsModal(ctx),
	}, "Mini-Apps"));
}
