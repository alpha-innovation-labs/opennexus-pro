import assert from "node:assert/strict";
import test from "node:test";
import { createBundledExtensionFactories } from "../../src/extensions/createBundledExtensionFactories.js";

test("createBundledExtensionFactories returns the bundled extension entrypoint", () => {
  const factories = createBundledExtensionFactories();

  assert.equal(factories.length, 1);
  assert.equal(typeof factories[0], "function");
});

test("the bundled extension entrypoint registers without throwing", () => {
  const factories = createBundledExtensionFactories();
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
    registerCommand() {},
    registerShortcut() {},
    registerTool() {},
  };

  assert.doesNotThrow(() => {
    factories[0](pi as never);
  });
});
