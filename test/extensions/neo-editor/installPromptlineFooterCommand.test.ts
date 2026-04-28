import assert from "node:assert/strict";
import test from "node:test";
import { installPromptlineFooter } from "../../../packages/extensions/src/neo-editor/features/promptline/installPromptlineFooter.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

test("installPromptlineFooter can replace the footer with a freshly selected model", () => {
	const rendered: string[] = [];
	const ctx = {
		model: { id: "gpt-5.5", provider: "openai-codex", reasoning: true },
		sessionManager: { getBranch: () => [] },
		ui: {
			setFooter(factory: (_tui: unknown, theme: unknown) => { render(width: number): string[] }) {
				rendered.push(...factory(null, createTestTheme()).render(100));
			},
		},
	};

	installPromptlineFooter(ctx as never, { getThinkingLevel: () => "high" } as never, {
		id: "MiniMaxAI/MiniMax-M2.7",
		provider: "minimax",
		reasoning: true,
	} as never);

	assert.match(rendered.join("\n"), /MiniMaxAI\/MiniMax-M2\.7\s+high/u);
	assert.doesNotMatch(rendered.join("\n"), /gpt-5\.5/u);
});
