import assert from "node:assert/strict";
import test from "node:test";
import { SettingsManager } from "../../../node_modules/@mariozechner/pi-coding-agent/dist/core/settings-manager.js";
import { handleInternalModelCommand } from "../../../src/extensions/shared/slash-menu/internal-commands/handleInternalModelCommand.js";

const originalCreate = SettingsManager.create;

test.afterEach(() => {
  SettingsManager.create = originalCreate;
});

test("handleInternalModelCommand adds selected model to persisted scoped models", async () => {
  let savedModels: string[] | undefined;
  SettingsManager.create = (() => ({
    getEnabledModels: () => ["openai-codex/gpt-5.4"],
    setEnabledModels: (models: string[] | undefined) => {
      savedModels = models;
    },
  })) as unknown as typeof SettingsManager.create;
  const model = { provider: "openai-codex", id: "gpt-5.5" };
  const notifications: Array<{ text: string; level: string }> = [];

  await handleInternalModelCommand(
    "openai-codex/gpt-5.5",
    {
      cwd: process.cwd(),
      modelRegistry: { find: () => model },
      ui: { notify: (text: string, level: string) => notifications.push({ text, level }) },
    } as never,
    { setModel: async () => true } as never,
  );

  assert.deepEqual(savedModels, ["openai-codex/gpt-5.4", "openai-codex/gpt-5.5"]);
  assert.deepEqual(notifications, [{ text: "Model: gpt-5.5", level: "info" }]);
});
