import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { logExtensionEvent } from "../../shared/observability/startup-debug.ts";
import { showToolCallsModal } from "./showToolCallsModal.js";

/**
 * Registers the tron tool-calls browser.
 *
 * @param pi Pi extension API.
 */
export default function registerToolCallsExtension(pi: ExtensionAPI): void {
	logExtensionEvent("last-tool-calls-modal", "init");
	pi.registerCommand("toolcalls", {
		description: "Show all tool calls from the current branch",
		handler: async (_args, ctx) => {
			await showToolCallsModal(ctx);
		},
	});
	pi.registerShortcut("ctrl+p", {
		description: "Show all tool calls from the current branch",
		handler: async (ctx) => {
			await showToolCallsModal(ctx);
		},
	});
}
