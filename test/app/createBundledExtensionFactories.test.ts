import assert from "node:assert/strict";
import test from "node:test";
import { createBundledExtensionFactories } from "../../packages/extensions/src/createBundledExtensionFactories.js";
import registerBundledExtensions from "../../packages/extensions/src/index.js";

test("createBundledExtensionFactories returns the source bundled extension entrypoint", async () => {
  const factories = await createBundledExtensionFactories();

  assert.deepEqual(factories, [registerBundledExtensions]);
});

test("the bundled extension entrypoint follows the root json feature flags", async () => {
  const factories = await createBundledExtensionFactories();
  const commands: string[] = [];
  const shortcuts: string[] = [];
  const tools: string[] = [];
  const pi = {
    events: {
      emit() {},
      on() {},
    },
    exec() {
      return Promise.resolve({ code: 0, stdout: "", stderr: "" });
    },
    getThinkingLevel() {
      return "medium";
    },
    getSessionName() {
      return "session";
    },
    getCommands() {
      return new Map();
    },
    on() {},
    setThinkingLevel() {},
    registerCommand(name: string) {
      commands.push(name);
    },
    registerMessageRenderer() {},
    registerShortcut(name: string) {
      shortcuts.push(name);
    },
    registerTool(tool: { name: string }) {
      tools.push(tool.name);
    },
  };

  await assert.doesNotReject(() => factories[0](pi as never));
  assert.ok(!shortcuts.includes("ctrl+i"));
  assert.ok(!shortcuts.includes("ctrl+;"));
  assert.ok(tools.includes("annotate"));
  assert.ok(tools.includes("read_pending_annotations"));
  assert.ok(tools.includes("claim_annotation"));
  assert.ok(tools.includes("resolve_annotation"));
  assert.ok(!tools.includes("context_usage"));
  assert.ok(commands.includes("dev-modal"));
});
