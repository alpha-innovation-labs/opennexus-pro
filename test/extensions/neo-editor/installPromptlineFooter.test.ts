import assert from "node:assert/strict";
import test from "node:test";
import { installPromptline } from "../../../packages/extensions/src/neo-editor/features/promptline/installPromptline.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

test("installPromptline replaces Pi default footer with Neo model footer", () => {
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

	assert.match(footerFactory?.(null, createTestTheme())?.render(80).join("\n") ?? "", /gpt-5\.5\s+high/u);
});
