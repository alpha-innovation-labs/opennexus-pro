import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import type { SystemPromptState } from "../state/types.js";

/**
 * Opens the multiline editor and saves a custom prompt when submitted.
 *
 * @param ctx Extension command context.
 * @param state System prompt override state.
 * @param prompt Prompt text used to prefill the editor.
 */
export async function editSystemPrompt(
	ctx: ExtensionCommandContext,
	state: SystemPromptState,
	prompt: string,
): Promise<void> {
	const updated = await ctx.ui.editor("Edit system prompt", prompt);
	if (updated === undefined) return;

	state.setOverride(updated);
	ctx.ui.notify("System prompt updated for future turns.", "info");
}
