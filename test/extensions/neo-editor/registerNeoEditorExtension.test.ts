import assert from "node:assert/strict";
import test from "node:test";
import registerNeoEditorExtension from "../../../src/extensions/neo-editor/registerNeoEditorExtension.js";

/**
 * Creates the minimum Pi stub required to register the Neo editor extension.
 *
 * @param shortcuts Captured shortcut registrations.
 * @returns Pi extension API stub.
 */
function createPiStub(shortcuts: string[]) {
  return {
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
    registerShortcut(shortcut: string) {
      shortcuts.push(shortcut);
    },
    setThinkingLevel() {},
  };
}

test("neo-editor does not register a conflicting clipboard image shortcut", () => {
  const shortcuts: string[] = [];

  registerNeoEditorExtension(createPiStub(shortcuts) as never);

  assert.deepEqual(shortcuts, []);
});
