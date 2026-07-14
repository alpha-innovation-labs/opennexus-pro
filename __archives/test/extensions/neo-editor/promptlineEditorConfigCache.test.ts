import assert from "node:assert/strict";
import test from "node:test";
import { PromptlineEditor } from "../../../packages/extension-core/src/neo-editor/features/promptline/PromptlineEditor.js";
import { clearTriggerSession } from "../../../packages/extension-core/src/neo-editor/features/promptline/trigger/sessionState.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

/**
 * Waits for queued promptline async work to settle.
 */
async function flushAsyncWork(): Promise<void> {
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Creates the minimum editor theme required by PromptlineEditor.
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
 * Creates the minimum TUI host required by PromptlineEditor.
 *
 * @param renderCounter Mutable render counter.
 * @returns TUI host stub.
 */
function createTui(renderCounter: { count: number }) {
  return {
    requestRender(): void {
      renderCounter.count += 1;
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
 * Creates the minimum extension context required by PromptlineEditor.
 *
 * @returns Extension context stub.
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

test("promptline typing does not reload cached config on ordinary input", async () => {
  const renders = { count: 0 };
  let refreshCount = 0;
  const editor = new PromptlineEditor(
    createTui(renders) as never,
    createEditorTheme() as never,
    { matches: () => false } as never,
    createContext() as never,
    createTestTheme() as never,
    () => "medium",
    () => undefined,
    () => "Untitled session",
    () => ({ triggerConfig: { rules: [] }, neoConfig: { clearEditorOnTriggerSubmit: true } }),
    async () => {
      refreshCount += 1;
      return { triggerConfig: { rules: [] }, neoConfig: { clearEditorOnTriggerSubmit: true } };
    },
  );

  editor.handleInput("a");
  await flushAsyncWork();

  assert.equal(refreshCount, 0);
});

test("promptline exact-match submit uses cached config without disk reload", async () => {
  const renders = { count: 0 };
  let refreshCount = 0;
  const submitted: string[] = [];
  const editor = new PromptlineEditor(
    createTui(renders) as never,
    createEditorTheme() as never,
    { matches: () => false } as never,
    createContext() as never,
    createTestTheme() as never,
    () => "medium",
    () => undefined,
    () => "Untitled session",
    () => ({
      triggerConfig: { rules: [{ match: { text: "shipit" }, action: { type: "submit" } }] },
      neoConfig: { clearEditorOnTriggerSubmit: true },
    }),
    async () => {
      refreshCount += 1;
      return { triggerConfig: { rules: [] }, neoConfig: { clearEditorOnTriggerSubmit: true } };
    },
  );
  editor.onSubmit = (value: string) => {
    submitted.push(value);
  };

  editor.setText("shipit");
  await flushAsyncWork();

  assert.deepEqual(submitted, ["shipit"]);
  assert.equal(refreshCount, 0);
});

test("promptline reload submit refreshes cached config after command completion", async () => {
  const renders = { count: 0 };
  let refreshCount = 0;
  const submitted: string[] = [];
  const editor = new PromptlineEditor(
    createTui(renders) as never,
    createEditorTheme() as never,
    { matches: () => false } as never,
    createContext() as never,
    createTestTheme() as never,
    () => "medium",
    () => undefined,
    () => "Untitled session",
    () => ({
      triggerConfig: { rules: [{ match: { text: "/reload" }, action: { type: "submit" } }] },
      neoConfig: { clearEditorOnTriggerSubmit: true },
    }),
    async () => {
      refreshCount += 1;
      return { triggerConfig: { rules: [] }, neoConfig: { clearEditorOnTriggerSubmit: true } };
    },
  );
  editor.onSubmit = async (value: string) => {
    submitted.push(value);
  };

  editor.setText("/reload");
  await flushAsyncWork();

  assert.deepEqual(submitted, ["/reload"]);
  assert.equal(refreshCount, 1);
  assert.ok(renders.count > 0);
});
