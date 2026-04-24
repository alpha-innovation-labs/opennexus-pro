import assert from "node:assert/strict";
import test from "node:test";
import { executeSubagentRun } from "../../../src/extensions/sub-agents/runtime/executeSubagentRun.js";

test("executeSubagentRun module loads with brief support", () => {
  assert.equal(typeof executeSubagentRun, "function");
});
