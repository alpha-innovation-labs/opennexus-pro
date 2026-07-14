import assert from "node:assert/strict";
import test from "node:test";
import stripAnsi from "strip-ansi";
import { SharedModal } from "../../packages/tui-kit/src/modal/SharedModal.js";
import { createTestTheme } from "../support/theme/createTestTheme.js";

/** Ensures fullscreen padding keeps the markdown line-number gutter alive until the footer. */
test("markdown pane filler preserves line-number separator until footer", () => {
  const modal = new SharedModal({
    footerLines: ["footer"],
    fullScreen: true,
    fullScreenRows: 10,
    headerLines: ["header"],
    panes: [
      { id: "left", size: 1, lines: ["left"] },
      { id: "right", size: 1, contentType: "markdown", lines: ["# Title"] },
    ],
    theme: createTestTheme(),
  });

  const lines = modal.render(44).map((line) => stripAnsi(line).trimEnd());
  const footerBorderIndex = lines.findIndex((line) => /^│─+┴─+│$/u.test(line));
  const bodyRows = lines.slice(3, footerBorderIndex);

  assert.equal(bodyRows.length > 1, true);
  assert.equal(bodyRows.every((line) => line.includes(" │ ")), true);
});
