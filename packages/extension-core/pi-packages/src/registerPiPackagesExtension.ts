import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { showPiPackagesModal } from "./command/showPiPackagesModal";

/**
 * Registers the pi-packages extension.
 *
 * Exposes the /pi-packages slash command that opens the package management modal.
 *
 * @param pi Pi extension API.
 */
export function registerPiPackagesExtension(pi: ExtensionAPI): void {
	pi.registerCommand("pi-packages", {
		description: "Open the Pi packages management modal.",
		handler: async (_args, ctx) => {
			await showPiPackagesModal(ctx);
		},
	});
}
