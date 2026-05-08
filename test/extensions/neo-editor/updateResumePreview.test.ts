import assert from "node:assert/strict";
import test from "node:test";
import { updateResumePreview, type ResumePreviewState } from "../../../packages/extensions/src/slash-menu/updateResumePreview.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

/**
 * Creates the minimum extension context for resume preview tests.
 *
 * @returns Fake extension context.
 */
function createContext() {
  return {
    ui: {
      theme: createTestTheme(),
    },
  };
}

test("resume preview uses the full right-pane width from the slash menu split", () => {
  const state: ResumePreviewState = { previewRequestId: 0 };
  const previewCache = new Map<string, string[]>([["resume:/tmp/nexus-session.jsonl:103", ["cached full-width preview"]]]);
  let renderedLines: string[] = [];

  updateResumePreview({
    width: 200,
    ctx: createContext() as never,
    item: { label: "Clean savings modal header/footer", value: "/tmp/nexus-session.jsonl" },
    state,
    previewCache,
    leftPaneRatio: 0.42,
    isRightPaneFocused: () => false,
    setRightLines: (lines) => {
      renderedLines = lines;
    },
    requestRender: () => undefined,
    isStillSelected: () => true,
  });

  assert.equal(state.renderedPreviewWidth, 103);
  assert.deepEqual(renderedLines, ["cached full-width preview"]);
});
