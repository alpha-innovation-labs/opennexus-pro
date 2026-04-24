import assert from "node:assert/strict";
import test from "node:test";
import { createWorkflowRun } from "../../../src/extensions/workflows/state/createWorkflowRun.js";
import { getWorkflowDefinitions } from "../../../src/extensions/workflows/state/getWorkflowDefinitions.js";
import { addWorkflowRun, getActiveWorkflowRun, updateActiveWorkflowStep } from "../../../src/extensions/workflows/state/workflowRunStore.js";

test("updates active workflow steps", () => {
  const run = createWorkflowRun(getWorkflowDefinitions()[0]!, "Test request");
  addWorkflowRun(run);

  updateActiveWorkflowStep("librarian", "Librarian", "running", "agent-1");
  const active = getActiveWorkflowRun();

  assert.equal(active?.steps.find((step) => step.id === "librarian")?.status, "running");
  assert.equal(active?.steps.find((step) => step.id === "librarian")?.agentId, "agent-1");
});
