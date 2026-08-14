import type { ExtensionAPI, ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { logExtensionEvent } from "@nexus/observability";
import { withSlashMenuGroup } from "@extensions/shared";
import { showToolCallsModal } from "./showToolCallsModal";

/**
 * Registers the tron tool-calls browser.
 *
 * @param pi Pi extension API.
 */
export default function registerToolCallsExtension(pi: ExtensionAPI): void {
	logExtensionEvent("last-tool-calls-modal", "init");
	pi.registerCommand(
		"toolcalls",
		withSlashMenuGroup(
			{
				description: "Show all tool calls from the current branch",
				handler: async (_args: string, ctx: ExtensionCommandContext) => {
					await showToolCallsModal(ctx);
				},
			},
			"Extensions",
		),
	);
}
