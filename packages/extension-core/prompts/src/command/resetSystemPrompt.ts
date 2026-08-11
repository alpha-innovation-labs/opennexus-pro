import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import type { SystemPromptState } from "../state/types";

/**
 * Clears the custom prompt override and restores the runtime default prompt.
 *
 * @param ctx Extension command context.
 * @param state System prompt override state.
 */
export function resetSystemPrompt(
	ctx: ExtensionCommandContext,
	state: SystemPromptState,
): void {
	state.reset();
	ctx.ui.notify("System prompt reset to default.", "info");
}
