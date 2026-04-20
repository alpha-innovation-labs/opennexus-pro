import assert from "node:assert/strict";
import test from "node:test";
import { createBundledExtensionFactories } from "../../src/extensions/createBundledExtensionFactories.js";

test("createBundledExtensionFactories returns the bundled extension entrypoint", () => {
  const factories = createBundledExtensionFactories();

  assert.equal(factories.length, 1);
  assert.equal(typeof factories[0], "function");
});

test("createBundledExtensionFactories can disable bundled extensions for child runs", () => {
  process.env.NEXUS_DISABLE_BUNDLED_EXTENSIONS = "1";

  try {
    const factories = createBundledExtensionFactories();
    assert.deepEqual(factories, []);
  } finally {
    delete process.env.NEXUS_DISABLE_BUNDLED_EXTENSIONS;
  }
});

test("the bundled extension entrypoint registers the currently enabled extensions", () => {
  const factories = createBundledExtensionFactories();
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

  assert.doesNotThrow(() => {
    factories[0](pi as never);
  });
  assert.ok(commands.includes("annotate"));
  assert.ok(commands.includes("observations"));
  assert.ok(tools.includes("annotate"));
  assert.ok(!commands.includes("sessions"));
  assert.ok(!shortcuts.includes("ctrl+i"));
  assert.ok(!shortcuts.includes("ctrl+;"));
});
