import assert from "node:assert/strict";
import test from "node:test";
import { getPromptlineModel } from "../../../packages/extension-core/src/neo-editor/features/promptline/getPromptlineModel.js";
import { setPromptlineModelOverride } from "../../../packages/extension-core/src/neo-editor/features/promptline/state.js";

test.afterEach(() => {
	setPromptlineModelOverride(undefined);
});

test("promptline model resolver prefers immediate model-selection override", () => {
	const contextModel = { provider: "openai-codex", id: "gpt-5.5" };
	const selectedModel = { provider: "anthropic", id: "claude-sonnet-4.5" };
	const ctx = { model: contextModel };

	setPromptlineModelOverride(selectedModel as never);

	assert.equal(getPromptlineModel(ctx as never), selectedModel);
});
