import assert from "node:assert/strict";
import test from "node:test";
import { PromptlineEditor } from "../../../src/extensions/neo-editor/promptline/PromptlineEditor.js";
import { clearTriggerSession } from "../../../src/extensions/neo-editor/promptline/trigger/sessionState.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

/**
 * Waits one macrotask so async autocomplete work can settle.
 */
async function flushAsyncWork(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Creates the minimal theme object required by the promptline editor.
 *
 * @returns Theme stub.
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
 * Creates the minimal TUI host required by the promptline editor.
 *
 * @returns Fake TUI host.
 */
function createTui() {
  return {
    requestRender(): void {
      return undefined;
    },
    showOverlay(): { hide: () => void; focus: () => void; isFocused: () => boolean } {
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

test("promptline suppresses base slash autocomplete when the Nexus slash modal opens", async () => {
  const editor = new PromptlineEditor(
    createTui() as never,
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

  editor.setAutocompleteProvider({
    async getSuggestions() {
      return {
        prefix: "/",
        items: [{ value: "resume", label: "/resume", description: "Resume a different session" }],
      };
    },
    applyCompletion(lines: string[], cursorLine: number, cursorCol: number) {
      return { lines, cursorLine, cursorCol };
    },
  } as never);

  editor.handleInput("/");
  await flushAsyncWork();

  assert.equal((editor as unknown as { isShowingAutocomplete: () => boolean }).isShowingAutocomplete(), false);
});
