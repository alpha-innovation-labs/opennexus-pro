import assert from "node:assert/strict";
import test from "node:test";
import { SettingsManager } from "../../../node_modules/@mariozechner/pi-coding-agent/dist/core/settings-manager.js";
import { handleInternalModelCommand } from "../../../packages/extensions/src/neo-editor/features/menu/internal-commands/handleInternalModelCommand.js";
import { setPromptlineRenderRequest } from "../../../packages/extensions/src/neo-editor/features/promptline/state.js";

const originalCreate = SettingsManager.create;

test.afterEach(() => {
  SettingsManager.create = originalCreate;
  setPromptlineRenderRequest(undefined);
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

test("handleInternalModelCommand updates context model and requests promptline render", async () => {
  SettingsManager.create = (() => ({
    getEnabledModels: () => undefined,
    setEnabledModels: () => undefined,
  })) as unknown as typeof SettingsManager.create;
  const selectedModel = { provider: "anthropic", id: "claude-sonnet-4.5", contextWindow: 200000 };
  const ctx = {
    cwd: process.cwd(),
    model: { provider: "openai-codex", id: "gpt-5.5" },
    modelRegistry: { find: () => selectedModel },
    ui: { notify: () => undefined },
  };
  let renderRequests = 0;
  setPromptlineRenderRequest(() => {
    renderRequests += 1;
  });

  await handleInternalModelCommand("anthropic/claude-sonnet-4.5", ctx as never, { setModel: async () => true } as never);

  assert.equal(ctx.model, selectedModel);
  assert.equal(renderRequests, 1);
});
