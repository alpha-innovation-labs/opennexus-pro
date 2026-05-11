import assert from "node:assert/strict";
import test from "node:test";
import type { Component } from "@earendil-works/pi-tui";
import { HotkeysModal } from "../../../packages/extension-core/src/hotkeys/HotkeysModal.js";
import { renderHelpShortcutRow } from "../../../packages/extension-core/src/neo-editor/features/help-shortcuts/renderHelpShortcutRow.js";
import { PromptlineEditor } from "../../../packages/extension-core/src/neo-editor/features/promptline/PromptlineEditor.js";
import { clearTriggerSession } from "../../../packages/extension-core/src/neo-editor/features/promptline/trigger/sessionState.js";
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
function createKeybindings() {
  return {
    matches: () => false,
    getResolvedBindings: () => ({
      "tui.input.submit": "enter",
      "app.model.select": "ctrl+l",
      "app.model.cycleForward": "ctrl+p",
    }),
    getDefinition: (keybinding: string) => {
      if (keybinding === "app.model.select") return { description: "Open model selector" };
      if (keybinding === "app.model.cycleForward") return { description: "Cycle to next model" };
      return { description: "Submit input" };
    },
  };
}

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

let originalRows: number | undefined;

test.beforeEach(() => {
  originalRows = process.stdout.rows;
  process.stdout.rows = 30;
});

test.afterEach(() => {
  process.stdout.rows = originalRows;
  clearTriggerSession();
});

test("hotkeys modal renders Pi groups with titles in borders and a bottom bar", async () => {
  const modal = new HotkeysModal(createTestTheme() as never, createKeybindings(), [], () => undefined);
  const view = await renderComponentInVirtualTerminal(() => modal, 120, 30);
  const text = view.join("\n");

  assert.match(text, /Nexus Triggers/);
  assert.match(text, /Input/);
  assert.match(text, /Models & Thinking/);
  assert.match(text, /Commands menu/);
  assert.doesNotMatch(text, /Open sessions/);
  assert.doesNotMatch(text, /Ctrl \+ ;/);
  assert.match(text, /┌.*Nexus Triggers.*┐/s);
  assert.match(text, /j\/k scroll/u);
  assert.match(text, /gg top · G bottom/u);
  assert.doesNotMatch(text, /Filter: type to filter keys or labels/);
});

test("hotkeys modal filters entries by typed key text", async () => {
  const modal = new HotkeysModal(createTestTheme() as never, createKeybindings(), [], () => undefined);

  modal.handleInput("/");
  modal.handleInput("m");
  modal.handleInput("o");
  modal.handleInput("d");
  const text = (await renderComponentInVirtualTerminal(() => modal, 120, 30)).join("\n");

  assert.match(text, /Open model selector/);
  assert.doesNotMatch(text, /Submit input/);
  assert.match(text, /Filter: mod/);
});

test("hotkeys modal filters by pressed ctrl chords", async () => {
  const modal = new HotkeysModal(createTestTheme() as never, createKeybindings(), [], () => undefined);

  modal.handleInput("/");
  modal.handleInput("\u0010");
  const text = (await renderComponentInVirtualTerminal(() => modal, 120, 30)).join("\n");

  assert.match(text, /Cycle to next model/);
  assert.doesNotMatch(text, /Submit input/);
  assert.match(text, /Filter: ctrl\+p/);
});

test("hotkeys modal ignores printable filters until slash enters filter mode", async () => {
  const modal = new HotkeysModal(createTestTheme() as never, createKeybindings(), [], () => undefined);

  modal.handleInput("m");
  modal.handleInput("o");
  modal.handleInput("d");
  const text = (await renderComponentInVirtualTerminal(() => modal, 120, 30)).join("\n");

  assert.match(text, /Submit input/);
  assert.doesNotMatch(text, /Filter: mod/);
});

test("hotkeys modal backspace edits the filter query", async () => {
  const modal = new HotkeysModal(createTestTheme() as never, createKeybindings(), [], () => undefined);

  modal.setFilterQuery("modez");
  modal.handleInput("\u007f");
  const text = (await renderComponentInVirtualTerminal(() => modal, 120, 30)).join("\n");

  assert.match(text, /Filter: mode/);
  assert.match(text, /Open model selector/);
});

test("help shortcut rows render shortcut glyphs teal and descriptions as default foreground", () => {
  const colors: string[] = [];
  const row = renderHelpShortcutRow({
    ...createTestTheme(),
    fg(color: string, value: string): string {
      colors.push(color);
      return value;
    },
  } as never, { label: "Commands menu", keys: "/" }, 32);

  assert.match(row, /Commands menu/u);
  assert.match(row, /\//u);
  assert.deepEqual(colors, ["success"]);
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

  assert.ok(overlay instanceof HotkeysModal);
  assert.equal(editor.getText(), "");
});
