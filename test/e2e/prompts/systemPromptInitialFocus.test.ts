import assert from "node:assert/strict";
import test from "node:test";
import { SystemPromptModal } from "../../../packages/extension-core/src/prompts/modal/SystemPromptModal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

/** Verifies the /SystemPrompt outline pane receives initial keyboard focus. */
test("/SystemPrompt starts with left pane focused", () => {
	const modal = new SystemPromptModal(
		createTestTheme(),
		["Available tools:", "- read: Read files", "", "Guidelines:", "Be direct."].join("\n"),
		false,
		() => {},
		undefined,
		() => {},
		() => 12,
	);

	const output = modal.render(80).join("\n");

	assert.match(output, /┃/u);
	assert.match(output, /\x1b\[38;2;45;212;191m.*Available tool/u);
});
