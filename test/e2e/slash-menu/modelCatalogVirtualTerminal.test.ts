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

test("/model shows available models before the full catalog with price columns", async () => {
  const picked: string[] = [];
  const modal = new SlashMenuModal(createContext() as never, () => "medium", () => undefined, () => undefined, () => undefined, (command) => { picked.push(command); });

  await modal.openLevel("model");
  const output = stripAnsi((await renderComponentInVirtualTerminal(() => modal, 140, 36)).join("\n"));
  const availableIndex = output.indexOf("Available Models");
  const catalogIndex = output.indexOf("Full Model Catalog");

  assert.ok(availableIndex >= 0, "available section is rendered");
  assert.ok(catalogIndex > availableIndex, "catalog section renders below available models");
  assert.match(output, /anthropic\/claude-test/u);

  modal.setQuery("openrouter/deepseek/deepseek-v4-pro");
  await modal.refresh();
  const filteredOutput = stripAnsi((await renderComponentInVirtualTerminal(() => modal, 140, 36)).join("\n"));

  assert.match(filteredOutput, /openrouter\/deepseek\/deepseek-v4-pro/u);
  assert.match(filteredOutput, /in \$0\.435\/M\s+out \$0\.87\/M/u);

  modal.handleInput("\r");
  await Promise.resolve();
  assert.deepEqual(picked, ["/nexus-model-select openrouter/deepseek/deepseek-v4-pro"]);
});
