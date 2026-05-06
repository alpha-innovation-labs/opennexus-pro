import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { withSlashMenuGroup } from "@nexus/extensions/neo-editor/features/menu/withSlashMenuGroup.js";
import { showMemoryModal } from "./showMemoryModal.js";

/**
 * Registers the /memory browser command.
 *
 * @param pi Extension API.
 */
export function registerMemoryCommand(pi: ExtensionAPI): void {
	pi.registerCommand("memory", withSlashMenuGroup({
		description: "Browse Nexus memory markdown",
		handler: async (_args, ctx) => showMemoryModal(ctx),
	}, "Mini-Apps"));
}
