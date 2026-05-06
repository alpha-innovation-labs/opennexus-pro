import assert from "node:assert/strict";
import test from "node:test";
import type { Component } from "@mariozechner/pi-tui";
import { PromptlineEditor } from "../../../packages/extensions/src/neo-editor/features/promptline/PromptlineEditor.js";
import { clearTriggerSession } from "../../../packages/extensions/src/neo-editor/features/promptline/trigger/sessionState.js";
import { WhichKeyModal } from "../../../packages/extensions/src/neo-editor/features/which-key/WhichKeyModal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

/** Waits one macrotask for overlay work to settle. */
async function flushAsyncWork(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Creates a minimal editor theme stub.
 *
 * @returns Editor theme stub.
 */
function createEditorTheme() {
  return { borderColor: (value: string) => value, selectList: { noMatch: (value: string) => value, selectedText: (value: string) => value, description: (value: string) => value, scrollInfo: (value: string) => value } };
}

/**
 * Creates a minimal extension context stub.
 *
 * @returns Extension context stub.
 */
function createContext() {
  return { cwd: process.cwd(), model: "gpt-5.4", ui: { theme: createTestTheme(), notify: () => undefined }, sessionManager: { getEntries: () => [], getTree: () => [], getSessionDir: () => process.cwd() } };
}

/**
 * Creates keybindings used by promptline and hotkeys modal.
 *
 * @returns Keybinding manager stub.
 */
function createKeybindings() {
  return { matches: () => false, getResolvedBindings: () => ({ "app.model.select": "ctrl+l" }), getDefinition: () => ({ description: "Open model selector" }) };
}

test.afterEach(() => {
  clearTriggerSession();
});

test("hotkeys filtering mirrors the query into the promptline editor", async () => {
  let overlay: Component | undefined;
  const editor = new PromptlineEditor(
    { requestRender: () => undefined, showOverlay: (component: Component) => { overlay = component; return { hide: () => undefined, focus: () => undefined, isFocused: () => true }; } } as never,
    createEditorTheme() as never,
    createKeybindings() as never,
    createContext() as never,
    createTestTheme() as never,
    () => "medium",
    () => undefined,
    () => "Untitled session",
    () => ({ triggerConfig: { rules: [] }, neoConfig: { clearEditorOnTriggerSubmit: true } }),
    async () => ({ triggerConfig: { rules: [] }, neoConfig: { clearEditorOnTriggerSubmit: true } }),
  );

  editor.handleInput("?");
  await flushAsyncWork();
  assert.ok(overlay instanceof WhichKeyModal);

  editor.handleInput("/");
  editor.handleInput("m");

  assert.equal(editor.getText(), "/m");
});
