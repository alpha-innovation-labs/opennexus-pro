import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { extractAppendSection } from "../modal/append-section/extractAppendSection.js";
import { replaceAppendSection } from "../modal/append-section/replaceAppendSection.js";
import type { SystemPromptState } from "../state/types.js";

/**
 * Opens the multiline editor and saves only the appendSection when submitted.
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
	const updated = await ctx.ui.editor("Edit appendSection", extractAppendSection(prompt));
	if (updated === undefined) return;

	state.setOverride(replaceAppendSection(prompt, updated));
	ctx.ui.notify("appendSection updated for future turns.", "info");
}
