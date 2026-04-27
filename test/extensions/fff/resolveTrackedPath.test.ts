import assert from "node:assert/strict";
import test from "node:test";
import { resolveTrackedPath } from "../../../packages/extensions/src/fff/runtime/resolveTrackedPath.js";

test("resolveTrackedPath keeps absolute tracked paths", () => {
  assert.equal(resolveTrackedPath("/repo", "/repo", "/repo/src/index.ts"), "/repo/src/index.ts");
});

test("resolveTrackedPath resolves relative tracked paths from project root", () => {
  assert.equal(resolveTrackedPath("/repo", "/repo/src", "packages/extensions/src/fff/index.ts"), "/repo/packages/extensions/src/fff/index.ts");
});
