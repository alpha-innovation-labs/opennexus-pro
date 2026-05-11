import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import type { SystemPromptState } from "../state/types.js";
import { SystemPromptModal } from "./SystemPromptModal.js";
import type { SystemPromptModalAction } from "./types.js";

/**
 * Opens the system prompt viewer and returns the chosen action.
 *
 * @param ctx Extension command context.
 * @param state System prompt override state.
 * @param prompt Prompt text to display.
 * @returns The action selected by the user.
 */
export async function showSystemPromptModal(
	ctx: ExtensionCommandContext,
	state: SystemPromptState,
	prompt: string,
): Promise<SystemPromptModalAction> {
	return ctx.ui.custom<SystemPromptModalAction>(
		(tui, theme, _keybindings, done) =>
			new SystemPromptModal(
				theme,
				prompt,
				state.getOverride() !== undefined,
				done,
				tui,
				() => tui.requestRender(),
				() => tui.terminal.rows,
			),
		{
			overlay: true,
			overlayOptions: { margin: 0, maxHeight: "100%", width: "100%" },
		},
	);
}
