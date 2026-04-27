import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { logExtensionEvent } from "@nexus/observability/startup-debug.js";
import { withSlashMenuGroup } from "../../neo-editor/features/menu/withSlashMenuGroup.js";
import { showObservationsModal } from "./showObservationsModal.js";

/**
 * Registers the observations command and keyboard shortcut.
 *
 * @param pi Pi extension API.
 */
export function registerObservationsCommand(pi: ExtensionAPI): void {
	logExtensionEvent("observations-command", "init");
	pi.registerCommand("observations", withSlashMenuGroup({
		description: "Show observations for the current conversation",
		handler: async (_args, ctx) => {
			await showObservationsModal(ctx);
		},
	}, "Chat"));
	pi.registerShortcut("ctrl+/", {
		description: "Open observations for the current conversation",
		handler: async (ctx) => {
			await showObservationsModal(ctx);
		},
	});
}
