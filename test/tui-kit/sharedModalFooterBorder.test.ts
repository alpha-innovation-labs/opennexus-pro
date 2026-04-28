import assert from "node:assert/strict";
import test from "node:test";
import stripAnsi from "strip-ansi";
import { SHARED_MODAL_FOOTER_BORDER, SharedModal } from "../../packages/tui-kit/src/modal/index.js";
import { createTestTheme } from "../support/theme/createTestTheme.js";

test("SharedModal renders footer border sentinel as a connected full-width border", () => {
  const modal = new SharedModal({
    theme: createTestTheme(),
    minWidth: 24,
    maxWidth: 24,
    panes: [{ id: "body", size: 1, lines: ["Body"] }],
    footerLines: ["Hint", SHARED_MODAL_FOOTER_BORDER, "Search"],
  });

  const output = modal.render(40).map((line) => stripAnsi(line).trim()).join("\n");

  assert.match(output, /│Hint\s+│\n├─+┤\n│Search\s+│/u);
});
