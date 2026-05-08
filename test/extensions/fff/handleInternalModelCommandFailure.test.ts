import assert from "node:assert/strict";
import test from "node:test";
import { SettingsManager } from "../../../node_modules/@mariozechner/pi-coding-agent/dist/core/settings-manager.js";
import { handleInternalModelCommand } from "../../../packages/extensions/src/slash-menu/internal-commands/handleInternalModelCommand.js";
import { getPromptlineModelOverride, setPromptlineModelOverride } from "../../../packages/extensions/src/neo-editor/features/promptline/state.js";

const originalCreate = SettingsManager.create;

test.afterEach(() => {
	SettingsManager.create = originalCreate;
	setPromptlineModelOverride(undefined);
});

test("handleInternalModelCommand clears promptline override when model selection fails", async () => {
	SettingsManager.create = (() => ({
		getEnabledModels: () => undefined,
		setEnabledModels: () => undefined,
	})) as unknown as typeof SettingsManager.create;
	const model = { provider: "anthropic", id: "claude-sonnet-4.5" };
	const notifications: Array<{ text: string; level: string }> = [];

	await handleInternalModelCommand(
		"anthropic/claude-sonnet-4.5",
		{
			cwd: process.cwd(),
			modelRegistry: { find: () => model },
			ui: { notify: (text: string, level: string) => notifications.push({ text, level }) },
		} as never,
		{ setModel: async () => false } as never,
	);

	assert.equal(getPromptlineModelOverride(), undefined);
	assert.deepEqual(notifications, [{ text: "No configured auth for anthropic/claude-sonnet-4.5", level: "error" }]);
});
