import assert from "node:assert/strict";
import test from "node:test";
import { getWhichKeyScrollTarget } from "../../../packages/extensions/src/neo-editor/features/which-key/getWhichKeyScrollTarget.js";

test("hotkeys scroll target resolves gg as top", () => {
  const first = getWhichKeyScrollTarget("g", false);
  const second = getWhichKeyScrollTarget("g", first.pendingGo);

  assert.deepEqual(second, { target: "top", pendingGo: false });
});

test("hotkeys scroll target resolves shift g as bottom", () => {
  assert.deepEqual(getWhichKeyScrollTarget("G", false), { target: "bottom", pendingGo: false });
});
