import type { ExtensionAPI, ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { withSlashMenuGroup } from "@extensions/shared";
import { logExtensionEvent } from "@nexus/observability";
import { showObservationsModal } from "./showObservationsModal";

/**
 * Registers the observations command and keyboard shortcut.
 *
 * @param pi Pi extension API.
 */
export function registerObservationsCommand(pi: ExtensionAPI): void {
	logExtensionEvent("observations-command", "init");
	pi.registerCommand(
		"observations",
		withSlashMenuGroup(
			{
				description: "Show observations for the current conversation",
				handler: async (_args: string, ctx: ExtensionCommandContext) => {
					await showObservationsModal(ctx);
				},
			},
			"Extensions",
		),
	);
	pi.registerShortcut("ctrl+/", {
		description: "Open observations for the current conversation",
		handler: async (ctx) => {
			await showObservationsModal(ctx);
		},
	});
}
