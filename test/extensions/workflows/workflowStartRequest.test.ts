import assert from "node:assert/strict";
import test from "node:test";
import { createWorkflowRun } from "../../../packages/mini-apps/src/workflows/state/createWorkflowRun.js";
import { getWorkflowDefinitions } from "../../../packages/mini-apps/src/workflows/state/getWorkflowDefinitions.js";
import { createWorkflowStartRequest } from "../../../packages/mini-apps/src/workflows/command/createWorkflowStartRequest.js";

test("creates a workflow-start request for the current agent", () => {
  const definition = getWorkflowDefinitions()[0]!;
  const run = createWorkflowRun(definition, "Add a feature");
  const prompt = createWorkflowStartRequest(definition, run, "Add a feature");

  assert.match(prompt, /Continuous Workflow Orchestrator/);
  assert.match(prompt, /Workflow run id:/);
  assert.match(prompt, /Selected workflow: Coding workflow/);
  assert.match(prompt, /Add a feature/);
});
