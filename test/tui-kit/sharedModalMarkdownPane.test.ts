import assert from "node:assert/strict";
import test from "node:test";
import stripAnsi from "strip-ansi";
import { renderModalPanes } from "../../packages/tui-kit/src/modal/renderModalPanes.js";
import { createTestTheme } from "../support/theme/createTestTheme.js";

test("shared modal can render a pane as markdown", () => {
  const lines = renderModalPanes(
    createTestTheme(),
    [{ id: "preview", size: 1, contentType: "markdown", lines: ["# Title", "- item"] }],
    24,
  );

  assert.equal(stripAnsi(lines[0]!), "│ 1 │  ① Title           │");
  assert.equal(stripAnsi(lines[1]!), "│ 2 │  ● item            │");
});
