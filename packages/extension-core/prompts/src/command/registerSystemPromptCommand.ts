import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { withSlashMenuGroup } from "@extensions/slash-menu/withSlashMenuGroup.js";
import type { SystemPromptState } from "../state/types.js";
import { handleSystemPromptCommand } from "./handleSystemPromptCommand.js";

/**
 * Registers the /SystemPrompt command.
 *
 * @param pi Pi extension API.
 * @param state System prompt override state.
 */
export function registerSystemPromptCommand(
	pi: ExtensionAPI,
	state: SystemPromptState,
): void {
	pi.registerCommand(
		"SystemPrompt",
		withSlashMenuGroup(
			{
				description: "View, edit, or reset the current system prompt.",
				handler: async (_args, ctx) => {
					await handleSystemPromptCommand(ctx, state);
				},
			},
			"Configuration",
		),
	);
}
