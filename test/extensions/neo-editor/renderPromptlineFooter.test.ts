import assert from "node:assert/strict";
import test from "node:test";
import { renderPromptlineFooter } from "../../../packages/extensions/src/neo-editor/features/promptline/render/renderPromptlineFooter.js";
import { setPromptlineModelOverride } from "../../../packages/extensions/src/neo-editor/features/promptline/state.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

test.afterEach(() => {
	setPromptlineModelOverride(undefined);
});

test("promptline footer renders the immediate selected model override", () => {
	const ctx = {
		model: { id: "gpt-5.5", provider: "openai-codex", reasoning: true },
		sessionManager: { getBranch: () => [] },
	};
	setPromptlineModelOverride({ id: "claude-sonnet-4.5", provider: "anthropic", reasoning: true } as never);

	const lines = renderPromptlineFooter(80, createTestTheme(), ctx as never, () => "high");
	const [line, clearingLine] = lines;

	assert.match(line ?? "", /claude-sonnet-4\.5\s+high/u);
	assert.doesNotMatch(line ?? "", /gpt-5\.5/u);
	assert.equal(line?.startsWith("                    "), true);
	assert.equal(clearingLine, " ".repeat(80));
});
