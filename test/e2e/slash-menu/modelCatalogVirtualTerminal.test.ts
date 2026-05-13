import assert from "node:assert/strict";
import stripAnsi from "strip-ansi";
import test from "node:test";
import { SlashMenuModal } from "../../../packages/extension-core/src/slash-menu/SlashMenuModal.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

/** Creates the minimum slash-menu context for /model rendering. */
function createContext() {
  const availableModel = {
    id: "claude-test",
    name: "Claude Test",
    provider: "anthropic",
    api: "anthropic-messages",
    reasoning: true,
    input: ["text"],
    cost: { input: 3, output: 15, cacheRead: 0.3, cacheWrite: 3.75 },
    contextWindow: 200000,
    maxTokens: 8192,
  };
  return {
    cwd: process.cwd(),
    ui: { theme: createTestTheme(), notify: () => undefined },
    model: availableModel,
    getSystemPrompt: () => "",
    modelRegistry: {
      getAvailable: () => [availableModel],
      refresh: () => undefined,
      authStorage: { get: () => undefined, hasAuth: () => false, list: () => [] },
    },
    sessionManager: { getEntries: () => [], getSessionDir: () => ".pi/agent/sessions", getTree: () => [] },
  };
}

/** Renders the modal into plain terminal text. */
async function renderModalOutput(modal: SlashMenuModal): Promise<string> {
  return stripAnsi((await renderComponentInVirtualTerminal(() => modal, 140, 36)).join("\n"));
}

test("/model switches between Models and All models tabs with provider-grouped prices", async () => {
  const picked: string[] = [];
  const modal = new SlashMenuModal(createContext() as never, () => "medium", () => undefined, () => undefined, () => undefined, (command) => { picked.push(command); });

  await modal.openLevel("model");
  const modelsOutput = await renderModalOutput(modal);
  assert.match(modelsOutput, /● Models\s+\|\s+○ All models/u);
  assert.match(modelsOutput, /anthropic\s+.*anthropic\/claude-test/us);
  assert.doesNotMatch(modelsOutput, /openrouter\/deepseek\/deepseek-v4-pro/u);

  modal.handleInput("\t");
  await modal.refresh();
  const allModelsOutput = await renderModalOutput(modal);
  assert.match(allModelsOutput, /○ Models\s+\|\s+● All models/u);

  modal.handleInput("\x1b[Z");
  await modal.refresh();
  const shiftedOutput = await renderModalOutput(modal);
  assert.match(shiftedOutput, /● Models\s+\|\s+○ All models/u);

  modal.handleInput("\t");
  modal.setQuery("openrouter/deepseek/deepseek-v4-pro");
  await modal.refresh();
  const filteredOutput = await renderModalOutput(modal);
  assert.match(filteredOutput, /openrouter\s+.*openrouter\/deepseek\/deepseek-v4-pro/us);
  assert.match(filteredOutput, /in \$0\.435\/M\s+out \$0\.87\/M/u);

  modal.handleInput("\r");
  await Promise.resolve();
  assert.deepEqual(picked, ["/nexus-model-select openrouter/deepseek/deepseek-v4-pro"]);
});
