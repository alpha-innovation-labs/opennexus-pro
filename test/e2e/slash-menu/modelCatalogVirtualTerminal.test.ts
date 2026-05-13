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
  assert.match(modelsOutput, /│● Models\s+\|\s+○ All models/u);
  assert.doesNotMatch(modelsOutput, /● ● Models/u);
  assert.match(modelsOutput, /anthropic\s+.*claude-test ✓/us);
  assert.doesNotMatch(modelsOutput, /anthropic\/claude-test/u);
  assert.doesNotMatch(modelsOutput, /Claude Test/u);
  assert.doesNotMatch(modelsOutput, /openrouter\/deepseek\/deepseek-v4-pro/u);

  modal.handleInput("\t");
  await modal.refresh();
  const allModelsOutput = await renderModalOutput(modal);
  assert.match(allModelsOutput, /│○ Models\s+\|\s+● All models/u);
  assert.doesNotMatch(allModelsOutput, /● ○ Models/u);

  modal.handleInput("\x1b[Z");
  await modal.refresh();
  const shiftedOutput = await renderModalOutput(modal);
  assert.match(shiftedOutput, /│● Models\s+\|\s+○ All models/u);
  assert.doesNotMatch(shiftedOutput, /● ● Models/u);

  modal.handleInput("\t");
  modal.setQuery("openrouter/deepseek/deepseek-v4-pro");
  await modal.refresh();
  const filteredOutput = await renderModalOutput(modal);
  assert.match(filteredOutput, /Context\s+In \$\/M\s+Out \$\/M\s+Cache in \$\/M\s+Cache out \$\/M/u);
  assert.match(filteredOutput, /openrouter\s+.*DeepSeek: DeepSeek V4 Pro/us);
  assert.doesNotMatch(filteredOutput, /• openrouter\/deepseek\/deepseek-v4-pro/u);
  assert.match(filteredOutput, /1,048,576\s+\$0\.435\s+\$0\.87\s+\$0\.0036\s+\$0/u);

  modal.handleInput("\r");
  await Promise.resolve();
  assert.deepEqual(picked, ["/nexus-model-select openrouter/deepseek/deepseek-v4-pro"]);
});
