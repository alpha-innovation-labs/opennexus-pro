import assert from "node:assert/strict";
import test from "node:test";
import { createBundledExtensionFactories } from "../../src/extensions/createBundledExtensionFactories.js";

test("createBundledExtensionFactories returns the bundled extension entrypoint", () => {
  const factories = createBundledExtensionFactories();

  assert.equal(factories.length, 1);
  assert.equal(typeof factories[0], "function");
});

test("the bundled extension entrypoint registers all enabled extensions", () => {
  const factories = createBundledExtensionFactories();
  const commands: string[] = [];
  const shortcuts: string[] = [];
  const pi = {
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
    registerShortcut(name: string) {
      shortcuts.push(name);
    },
    registerTool() {},
  };

  assert.doesNotThrow(() => {
    factories[0](pi as never);
  });
  assert.ok(commands.includes("term"));
  assert.ok(commands.includes("sessions"));
  assert.ok(shortcuts.includes("ctrl+i"));
  assert.ok(shortcuts.includes("ctrl+;"));
});
