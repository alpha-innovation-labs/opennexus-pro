import assert from "node:assert/strict";
import test from "node:test";
import { buildPromptline } from "../../../packages/extensions/src/neo-editor/features/promptline/render/buildPromptline.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

/**
 * Creates a minimal context for promptline render cache tests.
 *
 * @param state Mutable session and counter state.
 * @returns Extension context stub.
 */
function createContext(state: { leafId: string; calls: number }) {
  return {
    cwd: "/tmp/nexus",
    model: { id: "provider/model", contextWindow: 200000 },
    sessionManager: {
      getLeafId(): string {
        return state.leafId;
      },
    },
    getContextUsage() {
      state.calls += 1;
      return { tokens: 1000 + state.calls, contextWindow: 200000, percent: 1 };
    },
  };
}

test("promptline context usage is cached while rendering the same session leaf", () => {
  const state = { leafId: "leaf-a", calls: 0 };
  const ctx = createContext(state);
  const theme = createTestTheme();

  buildPromptline(ctx as never, theme as never, () => "medium", 100);
  buildPromptline(ctx as never, theme as never, () => "medium", 100);

  assert.equal(state.calls, 1);
});

test("promptline context usage refreshes when the active session leaf changes", () => {
  const state = { leafId: "leaf-a", calls: 0 };
  const ctx = createContext(state);
  const theme = createTestTheme();

  buildPromptline(ctx as never, theme as never, () => "medium", 100);
  state.leafId = "leaf-b";
  buildPromptline(ctx as never, theme as never, () => "medium", 100);

  assert.equal(state.calls, 2);
});
