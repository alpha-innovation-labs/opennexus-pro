import assert from "node:assert/strict";
import test from "node:test";
import { WorkflowRunsModal } from "../../../src/extensions/workflows/modal/WorkflowRunsModal.js";

test("WorkflowRunsModal module loads", () => {
  assert.equal(typeof WorkflowRunsModal, "function");
});
