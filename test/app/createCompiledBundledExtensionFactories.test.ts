import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createCompiledBundledExtensionFactories } from "../../src/extensions/createCompiledBundledExtensionFactories.js";
import { compiledBundledExtensionIds } from "../../src/extensions/generated/registerCompiledEnabledExtensions.js";

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
    on() {},
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

test("compiled bundled extension ids match enabled root feature flags", () => {
  const rootConfig = JSON.parse(readFileSync("feature-flags.json", "utf8"));
  const expectedIds = Object.entries(rootConfig.extensions)
    .filter(([, value]) => value.enabled)
    .map(([id]) => id);

  assert.deepEqual([...compiledBundledExtensionIds], expectedIds);
});

test("createCompiledBundledExtensionFactories returns the release entrypoint", async () => {
  const factories = await createCompiledBundledExtensionFactories();

  assert.equal(factories.length, 1);
  assert.equal(typeof factories[0], "function");
});

test("the compiled bundled extension entrypoint follows the bundled feature flags", async () => {
  const factories = await createCompiledBundledExtensionFactories();
  const commands: string[] = [];
  const shortcuts: string[] = [];
  const tools: string[] = [];
  const pi = createFakePi(commands, shortcuts, tools);

  assert.doesNotThrow(() => {
    factories[0](pi as never);
  });
  assert.ok(!commands.includes("toolcalls"));
  assert.ok(!commands.includes("annotate"));
  assert.ok(!commands.includes("extension"));
  assert.ok(!commands.includes("observations"));
  assert.ok(!commands.includes("sessions"));
  assert.ok(!shortcuts.includes("ctrl+i"));
  assert.ok(!shortcuts.includes("ctrl+;"));
  assert.ok(!tools.includes("annotate"));
});
