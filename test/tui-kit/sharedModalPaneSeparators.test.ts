import assert from "node:assert/strict";
import test from "node:test";
import { SharedModal } from "../../packages/tui-kit/src/modal/SharedModal.js";
import { createTestTheme } from "../support/theme/createTestTheme.js";

test("pane top and bottom borders avoid header and footer separator overlap", () => {
  const modal = new SharedModal({
    footerLines: ["footer"],
    headerLines: ["header"],
    panes: [
      { id: "left", size: 1, lines: ["left"] },
      { id: "right", size: 1, lines: ["right"] },
    ],
    theme: createTestTheme(),
  });

  const lines = modal.render(40).map((line) => line.trimEnd());

  assert.match(lines[0]!, /^\s*┌─+┐$/u);
  assert.match(lines[2]!, /^\s*│─+┬─+│$/u);
  assert.match(lines[3]!, /^\s*│.*│.*│$/u);
  assert.match(lines[4]!, /^\s*│─+┴─+│$/u);
  assert.match(lines.at(-1)!, /^\s*└─+┘$/u);
});
