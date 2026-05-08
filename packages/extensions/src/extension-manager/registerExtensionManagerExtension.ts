import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { withSlashMenuGroup } from "../slash-menu/withSlashMenuGroup.js";
import { showExtensionsModal } from "./command/showExtensionsModal.js";

/**
 * Registers the user-facing extension manager.
 *
 * @param pi Extension API.
 */
export function registerExtensionManagerExtension(pi: ExtensionAPI): void {
	pi.registerCommand("extensions", withSlashMenuGroup({
		description: "Show installed extensions",
		handler: async (_args, ctx) => {
			await showExtensionsModal(ctx);
		},
	}, "Extensions"));
}
