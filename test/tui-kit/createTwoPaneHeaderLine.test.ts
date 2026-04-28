import assert from "node:assert/strict";
import test from "node:test";
import stripAnsi from "strip-ansi";
import { createTwoPaneHeaderLine } from "../../packages/tui-kit/src/modal/select/createTwoPaneHeaderLine.js";
import { createTestTheme } from "../support/theme/createTestTheme.js";

test("createTwoPaneHeaderLine right-aligns the right title without focus markers", () => {
  const line = stripAnsi(createTwoPaneHeaderLine({
    activePane: "right",
    leftTitle: "Custom Commands",
    rightTitle: "● All [1] | ○ Global [2] | ○ Local [3]",
    showFocusMarkers: false,
    leftWidth: 20,
    rightWidth: 44,
    showLeftPane: true,
    showRightPane: true,
    uiTheme: createTestTheme(),
  }));

  assert.equal(line.includes("Details"), false);
  assert.doesNotMatch(line, /│/u);
  assert.match(line, /^Custom Commands\s+● All \[1\]/u);
});
