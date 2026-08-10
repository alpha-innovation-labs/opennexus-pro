import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerSystemPromptCommand } from "./command/registerSystemPromptCommand";
import { createSystemPromptState } from "./state/createSystemPromptState";

/**
 * Registers prompt-management commands and applies custom system prompt overrides.
 *
 * @param pi Pi extension API.
 */
export function registerPromptsExtension(pi: ExtensionAPI): void {
	const state = createSystemPromptState();

	registerSystemPromptCommand(pi, state);

	pi.on("before_agent_start", () => {
		const override = state.getOverride();
		if (override === undefined) return undefined;
		return { systemPrompt: override };
	});
}
