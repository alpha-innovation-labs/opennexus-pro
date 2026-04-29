import assert from "node:assert/strict";
import test from "node:test";
import { createCompiledBundledExtensionFactories } from "../../packages/extensions/src/createCompiledBundledExtensionFactories.js";
import { compiledBundledExtensionIds } from "../../packages/extensions/src/generated/registerCompiledEnabledExtensions.js";
import registerCompiledBundledExtensions from "../../packages/extensions/src/registerCompiledBundledExtensions.js";

/**
 * Creates a fake Pi extension API for compiled extension registration tests.
 *
 * @param commands Captured command names.
 * @param shortcuts Captured shortcut names.
 * @param tools Captured tool names.
 * @returns Fake Pi extension API.
 */
function createFakePi(commands: string[], shortcuts: string[], tools: string[]) {
  return {
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
}

test("compiled bundled extension ids are available to the release entrypoint", () => {
  assert.ok(compiledBundledExtensionIds.length > 0);
  const releaseIds = compiledBundledExtensionIds as readonly string[];
  assert.ok(!releaseIds.includes("dev"));
  assert.ok(!releaseIds.includes("feature-management"));
  assert.ok(!releaseIds.includes("annotate"));
  assert.ok(!releaseIds.includes("context-usage"));
  assert.ok(!releaseIds.includes("workspace"));
  assert.ok(!releaseIds.includes("workflows"));
  assert.ok(!releaseIds.includes("playground"));
  assert.ok(!releaseIds.includes("todo"));
});

test("createCompiledBundledExtensionFactories returns the release-bundled extension entrypoint", async () => {
  const factories = await createCompiledBundledExtensionFactories();

  assert.deepEqual(factories, [registerCompiledBundledExtensions]);
});

test("the compiled bundled extension entrypoint follows the bundled feature flags", async () => {
  const factories = await createCompiledBundledExtensionFactories();
  const commands: string[] = [];
  const shortcuts: string[] = [];
  const tools: string[] = [];
  const pi = createFakePi(commands, shortcuts, tools);

  await assert.doesNotReject(() => factories[0](pi as never));
  assert.ok(!shortcuts.includes("ctrl+i"));
  assert.ok(!shortcuts.includes("ctrl+;"));
  assert.ok(!tools.includes("annotate"));
  assert.ok(!tools.includes("read_pending_annotations"));
  assert.ok(!tools.includes("claim_annotation"));
  assert.ok(!tools.includes("resolve_annotation"));
  assert.ok(!commands.includes("dev-modal"));
  assert.ok(!commands.includes("features"));
});
