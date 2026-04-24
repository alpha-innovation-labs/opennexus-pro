import assert from "node:assert/strict";
import test from "node:test";
import registerNeoEditorExtension from "../../../src/extensions/neo-editor/registerNeoEditorExtension.js";

/**
 * Creates the minimum Pi stub required to register the Neo editor extension.
 *
 * @param shortcuts Captured shortcut registrations.
 * @returns Pi extension API stub.
 */
function createPiStub(shortcuts: Array<{ shortcut: string; description: string }>) {
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
    registerShortcut(shortcut: string, options: { description: string }) {
      shortcuts.push({ shortcut, description: options.description });
    },
    setThinkingLevel() {},
  };
}

/**
 * Temporarily overrides the reported platform for one test case.
 *
 * @param platform Platform name to expose through process.platform.
 * @param run Test body to execute while the override is active.
 * @returns Test body result.
 */
function withPlatform<T>(platform: NodeJS.Platform, run: () => T): T {
  const descriptor = Object.getOwnPropertyDescriptor(process, "platform");
  if (!descriptor) throw new Error("Missing process.platform descriptor");

  Object.defineProperty(process, "platform", {
    ...descriptor,
    value: platform,
  });

  try {
    return run();
  } finally {
    Object.defineProperty(process, "platform", descriptor);
  }
}

test("neo-editor registers macOS clipboard image pasting", () => {
  const shortcuts: Array<{ shortcut: string; description: string }> = [];

  withPlatform("darwin", () => {
    registerNeoEditorExtension(createPiStub(shortcuts) as never);
  });

  assert.deepEqual(shortcuts, [
    {
      shortcut: "ctrl+v",
      description: "Paste image from clipboard",
    },
  ]);
});

test("neo-editor skips clipboard image pasting off macOS", () => {
  const shortcuts: Array<{ shortcut: string; description: string }> = [];

  withPlatform("linux", () => {
    registerNeoEditorExtension(createPiStub(shortcuts) as never);
  });

  assert.deepEqual(shortcuts, []);
});
