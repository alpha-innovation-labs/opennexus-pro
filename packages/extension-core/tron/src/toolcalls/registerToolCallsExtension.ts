import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { logExtensionEvent } from "@nexus/observability/startup-debug";
import { withSlashMenuGroup } from '@extensions/slash-menu/withSlashMenuGroup.js';
import { showToolCallsModal } from "./showToolCallsModal";

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
