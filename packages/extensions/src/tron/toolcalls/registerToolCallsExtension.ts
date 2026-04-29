import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { logExtensionEvent } from "@nexus/observability/startup-debug.js";
import { withSlashMenuGroup } from "../../neo-editor/features/menu/withSlashMenuGroup.js";
import { showToolCallsModal } from "./showToolCallsModal.js";

/**
 * Registers the tron tool-calls browser.
 *
 * @param pi Pi extension API.
 */
export default function registerToolCallsExtension(pi: ExtensionAPI): void {
	logExtensionEvent("last-tool-calls-modal", "init");
	pi.registerCommand("toolcalls", withSlashMenuGroup({
		description: "Show all tool calls from the current branch",
		handler: async (_args, ctx) => {
			await showToolCallsModal(ctx as never);
		},
	}, "Extensions"));
}
