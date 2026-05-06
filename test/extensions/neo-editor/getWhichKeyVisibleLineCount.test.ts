import assert from "node:assert/strict";
import test from "node:test";
import { getWhichKeyVisibleLineCount } from "../../../packages/extensions/src/neo-editor/features/which-key/getWhichKeyVisibleLineCount.js";

/**
 * Returns total modal rows for a visible content count.
 *
 * @param visibleLines Visible content lines.
 * @returns Total modal rows including frame.
 */
function getTotalRows(visibleLines: number): number {
  return visibleLines + 6;
}

test("hotkeys visible line count fits within fullscreen height", () => {
  const terminalRows = 40;
  const visibleLines = getWhichKeyVisibleLineCount(terminalRows, 1, 1);

  assert.equal(getTotalRows(visibleLines) <= terminalRows, true);
});
