import assert from "node:assert/strict";
import test from "node:test";
import { installPromptline } from "../../../packages/extensions/src/neo-editor/features/promptline/installPromptline.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

test("installPromptline hides Pi default footer", () => {
	let footerFactory: ((tui: unknown, theme: unknown) => { render(width: number): string[] }) | undefined;
	const ctx = {
		cwd: process.cwd(),
		model: { id: "gpt-5.5", provider: "openai-codex", reasoning: true },
		sessionManager: { getBranch: () => [] },
		ui: {
			theme: createTestTheme(),
			setEditorComponent: () => undefined,
			setFooter: (factory: typeof footerFactory) => {
				footerFactory = factory;
			},
		},
	};

	installPromptline(ctx as never, {
		exec: async () => ({ code: 0, stdout: "", stderr: "" }),
		getThinkingLevel: () => "high",
		setThinkingLevel: () => undefined,
		getSessionName: () => undefined,
		getPromptlineConfig: () => ({ editorTriggers: [], neoConfig: {} }),
		refreshPromptlineConfig: async () => ({ editorTriggers: [], neoConfig: {} }),
	} as never);

	assert.deepEqual(footerFactory?.(null, createTestTheme())?.render(80), []);
});
