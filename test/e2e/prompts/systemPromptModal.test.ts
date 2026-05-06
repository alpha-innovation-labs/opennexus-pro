import assert from "node:assert/strict";
import test from "node:test";
import type { SystemPromptModalAction } from "../../../packages/extensions/src/prompts/modal/types.js";
import { SystemPromptModal } from "../../../packages/extensions/src/prompts/modal/SystemPromptModal.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

/**
 * Creates a system prompt modal fixed to a deterministic test row count.
 *
 * @param prompt Prompt content to render.
 * @param done Action callback.
 * @returns Test modal instance.
 */
function createModal(
	prompt: string,
	done: (action: SystemPromptModalAction) => void = () => {},
): SystemPromptModal {
	return new SystemPromptModal(
		createTestTheme(),
		prompt,
		false,
		done,
		undefined,
		() => {},
		() => 12,
	);
}

test("/SystemPrompt modal renders fullscreen prompt controls", async () => {
	const viewport = await renderComponentInVirtualTerminal(
		() => createModal("You are Nexus.\nFollow project rules."),
		120,
		24,
	);
	const output = viewport.join("\n");

	assert.match(output, /System Prompt \(default\)/u);
	assert.match(output, /You are Nexus\./u);
	assert.match(output, /Follow project rules\./u);
	assert.match(
		output,
		/j\/k scroll · gg top · Shift\+G bottom · e\/Ctrl\+G edit/u,
	);
	assert.equal(viewport[0]?.length, 120);
});

test("/SystemPrompt modal returns edit and reset actions", () => {
	const actions: SystemPromptModalAction[] = [];
	const modal = createModal("Prompt", (action) => actions.push(action));

	modal.handleInput("e");
	modal.handleInput("\x07");
	modal.handleInput("r");

	assert.deepEqual(actions, [
		{ type: "edit" },
		{ type: "edit" },
		{ type: "reset" },
	]);
});

test("/SystemPrompt modal supports vim-style prompt scrolling", () => {
	const prompt = Array.from(
		{ length: 20 },
		(_, index) => `line-${index + 1}`,
	).join("\n");
	const modal = createModal(prompt);

	assert.match(modal.render(80).join("\n"), /line-1/u);
	modal.handleInput("j");
	assert.doesNotMatch(modal.render(80).join("\n"), /line-1/u);
	modal.handleInput("G");
	assert.match(modal.render(80).join("\n"), /line-20/u);
	modal.handleInput("g");
	modal.handleInput("g");
	assert.match(modal.render(80).join("\n"), /line-1/u);
});
