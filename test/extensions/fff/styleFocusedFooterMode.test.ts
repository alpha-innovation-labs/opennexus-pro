import assert from "node:assert/strict";
import test from "node:test";
import { styleFocusedFooterMode } from "../../../packages/extensions/src/slash-menu/styleFocusedFooterMode.js";

test("styleFocusedFooterMode renders white text on dark red background", () => {
  assert.equal(styleFocusedFooterMode("Detail"), "\x1b[97;48;5;88m Detail \x1b[0m");
});
