import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { withSlashMenuGroup } from "../slash-menu/withSlashMenuGroup.js";
import { showPiPackagesModal } from "./command/showPiPackagesModal.js";

/**
 * Registers the user-facing Pi packages manager.
 *
 * @param pi Extension API.
 */
export function registerPiPackagesExtension(pi: ExtensionAPI): void {
	pi.registerCommand("pi-packages", withSlashMenuGroup({
		description: "Show installed Pi packages",
		handler: async (_args, ctx) => {
			await showPiPackagesModal(ctx);
		},
	}, "Packages"));
}
