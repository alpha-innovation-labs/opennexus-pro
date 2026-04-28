import assert from "node:assert/strict";
import test from "node:test";
import { applyModelChangeDisplayPatch } from "../../packages/pi-platform/src/applyModelChangeDisplayPatch.js";
import { FooterComponent } from "../../node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/components/footer.js";
import { initializePiThemes } from "../support/theme/initializePiThemes.js";

/**
 * Creates a minimal footer session double.
 *
 * @returns Footer session double.
 */
function createFooterSession() {
	return {
		modelRegistry: { isUsingOAuth: () => false },
		getContextUsage: () => ({ contextWindow: 200000, percent: 0 }),
		state: {
			model: { id: "gpt-5.5", provider: "openai-codex", reasoning: true },
			thinkingLevel: "high",
		},
		sessionManager: {
			getCwd: () => process.cwd(),
			getEntries: () => [],
			getSessionName: () => undefined,
		},
	};
}

/**
 * Creates a minimal footer data provider double.
 *
 * @returns Footer data provider double.
 */
function createFooterDataProvider() {
	return {
		getAvailableProviderCount: () => 1,
		getExtensionStatuses: () => new Map(),
		getGitBranch: () => undefined,
	};
}

test("model change display patch hides Pi default footer", async () => {
	await initializePiThemes();
	applyModelChangeDisplayPatch();
	const footer = new FooterComponent(createFooterSession() as never, createFooterDataProvider() as never);

	assert.deepEqual(footer.render(100), []);
});
