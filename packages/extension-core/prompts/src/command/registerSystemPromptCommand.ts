import type {
	ExtensionAPI,
	ExtensionCommandContext,
} from "@earendil-works/pi-coding-agent";
import { withSlashMenuGroup } from "@extensions/slash-menu";
import type { SystemPromptState } from "../state/types";
import { handleSystemPromptCommand } from "./handleSystemPromptCommand";

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
				handler: async (
					_args: string,
					ctx: ExtensionCommandContext,
				) => {
					await handleSystemPromptCommand(ctx, state);
				},
			},
			"Configuration",
		),
	);
}
