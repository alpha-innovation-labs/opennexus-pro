import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { withSlashMenuGroup } from "@nexus/extensions/neo-editor/features/menu/withSlashMenuGroup.js";
import { showMiniAppsModal } from "./command/showMiniAppsModal.js";

/**
 * Registers the user-facing mini-app manager command.
 *
 * @param pi Extension API.
 */
export function registerMiniAppManagerExtension(pi: ExtensionAPI): void {
	pi.registerCommand("mini-apps", withSlashMenuGroup({
		description: "Show installed mini-apps",
		handler: async (_args, ctx) => {
			await showMiniAppsModal(ctx);
		},
	}, "Mini-Apps"));
}
