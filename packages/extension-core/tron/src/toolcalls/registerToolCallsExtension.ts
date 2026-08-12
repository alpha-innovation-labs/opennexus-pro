import type { ExtensionAPI, ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { logExtensionEvent } from "@nexus/observability/startup-debug";
import { showToolCallsModal } from "./showToolCallsModal";

/**
 * Attaches Nexus slash-menu grouping metadata to a Pi command definition.
 *
 * @param definition Pi command definition.
 * @param menuGroup Nexus slash-menu group label.
 * @returns Command definition with runtime menu-group metadata.
 */
function withSlashMenuGroup<T extends object>(definition: T, menuGroup: string): T {
	return Object.assign(definition, { menuGroup });
}

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
