import assert from "node:assert/strict";
import test from "node:test";
import { SettingsManager } from "../../../node_modules/@mariozechner/pi-coding-agent/dist/core/settings-manager.js";
import { handleInternalModelCommand } from "../../../packages/extensions/src/slash-menu/internal-commands/handleInternalModelCommand.js";
import { getPromptlineModelOverride, setPromptlineModelOverride, setPromptlineRenderRequest } from "../../../packages/extensions/src/neo-editor/features/promptline/state.js";

const originalCreate = SettingsManager.create;

test.afterEach(() => {
  SettingsManager.create = originalCreate;
  setPromptlineRenderRequest(undefined);
  setPromptlineModelOverride(undefined);
});

test("handleInternalModelCommand adds selected model to persisted scoped models", async () => {
  let savedModels: string[] | undefined;
  SettingsManager.create = (() => ({
    getEnabledModels: () => ["openai-codex/gpt-5.4"],
    setEnabledModels: (models: string[] | undefined) => {
      savedModels = models;
    },
  })) as unknown as typeof SettingsManager.create;
  const model = { provider: "openai-codex", id: "gpt-5.5", reasoning: true };
  const notifications: Array<{ text: string; level: string }> = [];

  await handleInternalModelCommand(
    "openai-codex/gpt-5.5",
    {
      cwd: process.cwd(),
      modelRegistry: { find: () => model },
      ui: {
        notify: (text: string, level: string) => notifications.push({ text, level }),
      },
    } as never,
    { getThinkingLevel: () => "high", setModel: async () => true } as never,
  );

  assert.deepEqual(savedModels, ["openai-codex/gpt-5.4", "openai-codex/gpt-5.5"]);
  assert.deepEqual(notifications, []);
});

test("handleInternalModelCommand stores model override before setting model and requests promptline render", async () => {
  SettingsManager.create = (() => ({
    getEnabledModels: () => undefined,
    setEnabledModels: () => undefined,
  })) as unknown as typeof SettingsManager.create;
  const selectedModel = { provider: "anthropic", id: "claude-sonnet-4.5", contextWindow: 200000, reasoning: true };
  const ctx = {
    cwd: process.cwd(),
    get model() {
      return { provider: "openai-codex", id: "gpt-5.5" };
    },
    modelRegistry: { find: () => selectedModel },
    sessionManager: { getBranch: () => [] },
    ui: {
      notify: () => undefined,
    },
  };
  let renderRequests = 0;
  let forcedRender = false;
  setPromptlineRenderRequest((force = false) => {
    renderRequests += 1;
    forcedRender = force;
  });

  let overrideDuringSetModel: unknown;

  await handleInternalModelCommand("anthropic/claude-sonnet-4.5", ctx as never, {
    getThinkingLevel: () => "high",
    setModel: async () => {
      overrideDuringSetModel = getPromptlineModelOverride();
      return true;
    },
  } as never);

  assert.equal(overrideDuringSetModel, selectedModel);
  assert.equal(getPromptlineModelOverride(), selectedModel);
  assert.equal(renderRequests, 1);
  assert.equal(forcedRender, true);
});
