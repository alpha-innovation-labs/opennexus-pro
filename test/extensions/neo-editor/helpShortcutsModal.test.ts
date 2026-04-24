import assert from "node:assert/strict";
import test from "node:test";
import type { Component } from "@mariozechner/pi-tui";
import { HelpShortcutsModal } from "../../../src/extensions/neo-editor/help-shortcuts/HelpShortcutsModal.js";
import { PromptlineEditor } from "../../../src/extensions/neo-editor/promptline/PromptlineEditor.js";
import { clearTriggerSession } from "../../../src/extensions/neo-editor/promptline/trigger/sessionState.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

/** Waits one macrotask for overlay work to settle. */
async function flushAsyncWork(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Creates the minimal theme object required by the promptline editor.
 *
 * @returns Editor theme stub.
 */
function createEditorTheme() {
  return {
    borderColor(value: string): string {
      return value;
    },
    selectList: {
      noMatch(value: string): string {
        return value;
      },
      selectedText(value: string): string {
        return value;
      },
      description(value: string): string {
        return value;
      },
      scrollInfo(value: string): string {
        return value;
      },
    },
  };
}

/**
 * Creates the minimal extension context required by the promptline editor.
 *
 * @returns Fake extension context.
 */
function createContext() {
  return {
    cwd: process.cwd(),
    model: "gpt-5.4",
    ui: {
      theme: createTestTheme(),
      notify(): void {
        return undefined;
      },
    },
    sessionManager: {
      getEntries(): [] {
        return [];
      },
      getTree(): [] {
        return [];
      },
      getSessionDir(): string {
        return process.cwd();
      },
    },
  };
}

test.afterEach(() => {
  clearTriggerSession();
});

test("help shortcuts modal renders grouped panels with titles in borders", async () => {
  const modal = new HelpShortcutsModal(createTestTheme() as never, () => undefined);
  const view = await renderComponentInVirtualTerminal(() => modal, 120, 30);
  const text = view.join("\n");

  assert.match(text, /Basics/);
  assert.match(text, /Triggers/);
  assert.match(text, /Modes/);
  assert.match(text, /Commands menu/);
  assert.match(text, /┌.*Navigation.*┐/s);
});

test("question mark as the first editor character opens help instead of typing", async () => {
  let overlay: Component | undefined;
  const editor = new PromptlineEditor(
    {
      requestRender(): void {
        return undefined;
      },
      showOverlay(component: Component): { hide: () => void; focus: () => void; isFocused: () => boolean } {
        overlay = component;
        return {
          hide(): void {
            return undefined;
          },
          focus(): void {
            return undefined;
          },
          isFocused(): boolean {
            return true;
          },
        };
      },
    } as never,
    createEditorTheme() as never,
    { matches: () => false } as never,
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

  assert.ok(overlay instanceof HelpShortcutsModal);
  assert.equal(editor.getText(), "");
});
