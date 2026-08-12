import type { ExtensionAPI, ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { withSlashMenuGroup } from "@extensions/slash-menu";
import { setLatestSystemPromptOptions } from "./contextUsageState";
import { showContextUsageCommand } from "./showContextUsageCommand";

/**
 * Registers context usage tool and /context command.
 *
 * @param pi Pi extension API.
 */
export function registerContextUsageExtension(pi: ExtensionAPI): void {
	pi.on("before_agent_start", (event) => {
		setLatestSystemPromptOptions(event.systemPromptOptions);
	});

	pi.registerCommand(
		"context",
		withSlashMenuGroup(
			{
				description: "Show current context-window usage",
				handler: async (_args: string, ctx: ExtensionCommandContext) => {
					await showContextUsageCommand(ctx);
				},
			},
			"Extensions",
		),
	);

	// context_usage tool removed
}
