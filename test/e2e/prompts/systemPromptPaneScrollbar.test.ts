import assert from "node:assert/strict";
import test from "node:test";
import stripAnsi from "strip-ansi";
import { renderPaneScrollbar } from "../../../packages/extension-core/src/prompts/modal/scroll/renderPaneScrollbar.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

/** Verifies pane scrollbars do not paint a full-height track over pane separators. */
test("pane scrollbar does not draw muted full-height vertical track", () => {
  const lines = renderPaneScrollbar(["one", "two", "three", "four"], 10, 0, 20, createTestTheme());

  assert.equal(lines.map(stripAnsi).filter((line) => line.endsWith("│")).length, 0);
  assert.equal(lines.map(stripAnsi).filter((line) => line.endsWith("┃")).length > 0, true);
});
