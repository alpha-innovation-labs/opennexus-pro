import assert from "node:assert/strict";
import test from "node:test";
import { getHotkeysScrollTarget } from "../../../packages/extensions/src/hotkeys/getHotkeysScrollTarget.js";

test("hotkeys scroll target resolves gg as top", () => {
  const first = getHotkeysScrollTarget("g", false);
  const second = getHotkeysScrollTarget("g", first.pendingGo);

  assert.deepEqual(second, { target: "top", pendingGo: false });
});

test("hotkeys scroll target resolves shift g as bottom", () => {
  assert.deepEqual(getHotkeysScrollTarget("G", false), { target: "bottom", pendingGo: false });
});
