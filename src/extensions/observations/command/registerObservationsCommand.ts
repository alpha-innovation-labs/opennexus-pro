import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { logExtensionEvent } from "../../primitives/observability/startup-debug.ts";
import { showObservationsModal } from "./showObservationsModal.js";

/**
 * Registers the observations command and keyboard shortcut.
 *
 * @param pi Pi extension API.
 */
export function registerObservationsCommand(pi: ExtensionAPI): void {
	logExtensionEvent("observations-command", "init");
	pi.registerCommand("observations", {
		description: "Show observations for the current conversation",
		handler: async (_args, ctx) => {
			await showObservationsModal(ctx);
		},
	});
	pi.registerShortcut("ctrl+/", {
		description: "Open observations for the current conversation",
		handler: async (ctx) => {
			await showObservationsModal(ctx);
		},
	});
}
