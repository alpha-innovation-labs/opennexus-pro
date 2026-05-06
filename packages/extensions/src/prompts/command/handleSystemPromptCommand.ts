import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { showSystemPromptModal } from "../modal/showSystemPromptModal.js";
import { getEffectiveSystemPrompt } from "../state/getEffectiveSystemPrompt.js";
import type { SystemPromptState } from "../state/types.js";
import { editSystemPrompt } from "./editSystemPrompt.js";
import { resetSystemPrompt } from "./resetSystemPrompt.js";

/**
 * Runs the system prompt viewer command loop until the user closes it.
 *
 * @param ctx Extension command context.
 * @param state System prompt override state.
 */
export async function handleSystemPromptCommand(
	ctx: ExtensionCommandContext,
	state: SystemPromptState,
): Promise<void> {
	if (!ctx.hasUI) {
		ctx.ui.notify(
			"/SystemPrompt requires an interactive UI session.",
			"warning",
		);
		return;
	}

	while (true) {
		const prompt = getEffectiveSystemPrompt(state, ctx.getSystemPrompt());
		const action = await showSystemPromptModal(ctx, state, prompt);
		if (action.type === "close") return;
		if (action.type === "edit") await editSystemPrompt(ctx, state, prompt);
		if (action.type === "reset") resetSystemPrompt(ctx, state);
		if (action.type === "update") {
			state.setOverride(action.prompt);
			ctx.ui.notify("System prompt updated for future turns.", "info");
		}
	}
}
