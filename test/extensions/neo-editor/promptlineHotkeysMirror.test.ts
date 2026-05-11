import assert from "node:assert/strict";
import test from "node:test";
import type { Component } from "@earendil-works/pi-tui";
import { setRuntimeExtensionFeatureState } from "../../../packages/feature-flags/src/runtimeExtensionFeatureState.js";
import { PromptlineEditor } from "../../../packages/extension-core/src/neo-editor/features/promptline/PromptlineEditor.js";
import { clearTriggerSession } from "../../../packages/extension-core/src/neo-editor/features/promptline/trigger/sessionState.js";
import { HotkeysModal } from "../../../packages/extension-core/src/hotkeys/HotkeysModal.js";
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
  setRuntimeExtensionFeatureState("hotkeys", true);
  setRuntimeExtensionFeatureState("slash-menu", true);
  clearTriggerSession();
});

/**
 * Creates a PromptlineEditor with test doubles for overlay behavior.
 *
 * @param onOverlay Callback invoked when an overlay is shown.
 * @returns Promptline editor instance.
 */
function createPromptlineEditor(onOverlay: (component: Component) => void = () => undefined): PromptlineEditor {
  return new PromptlineEditor(
    { requestRender: () => undefined, showOverlay: (component: Component) => { onOverlay(component); return { hide: () => undefined, focus: () => undefined, isFocused: () => true }; } } as never,
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
}

test("hotkeys filtering mirrors the query into the promptline editor", async () => {
  let overlay: Component | undefined;
  const editor = createPromptlineEditor((component) => { overlay = component; });

  editor.handleInput("?");
  await flushAsyncWork();
  assert.ok(overlay instanceof HotkeysModal);

  editor.handleInput("/");
  editor.handleInput("m");

  assert.equal(editor.getText(), "/m");
});

test("disabled hotkeys does not open the hotkeys overlay from promptline", async () => {
  setRuntimeExtensionFeatureState("hotkeys", false);
  let overlay: Component | undefined;
  const editor = createPromptlineEditor((component) => { overlay = component; });

  editor.handleInput("?");
  await flushAsyncWork();

  assert.equal(overlay, undefined);
});

test("disabled slash-menu does not open the custom slash overlay from promptline", async () => {
  setRuntimeExtensionFeatureState("slash-menu", false);
  let overlay: Component | undefined;
  const editor = createPromptlineEditor((component) => { overlay = component; });

  editor.handleInput("/");
  await flushAsyncWork();

  assert.equal(overlay, undefined);
  assert.equal(editor.getText(), "/");
});

test("promptline keeps large bracketed paste text visible instead of inserting a paste marker", () => {
  const editor = createPromptlineEditor();
  const pastedText = Array.from({ length: 13 }, (_, index) => `line-${index + 1}`).join("\n");

  editor.handleInput(`\x1b[200~${pastedText}\x1b[201~`);

  assert.equal(editor.getText(), pastedText);
  assert.doesNotMatch(editor.getText(), /\[paste #/u);
});
