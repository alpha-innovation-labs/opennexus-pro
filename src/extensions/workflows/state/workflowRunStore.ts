import type { WorkflowRun, WorkflowStepStatus } from "./types.js";

const runs: WorkflowRun[] = [];
let activeRunId: string | undefined;

/**
 * Adds a workflow run and marks it active.
 *
 * @param run Workflow run to add.
 */
export function addWorkflowRun(run: WorkflowRun): void {
  runs.unshift(run);
  activeRunId = run.id;
}

/**
 * Returns all workflow runs.
 *
 * @returns Workflow runs ordered newest first.
 */
export function getWorkflowRuns(): WorkflowRun[] {
  return runs;
}

/**
 * Returns the active workflow run.
 *
 * @returns Active workflow run, if any.
 */
export function getActiveWorkflowRun(): WorkflowRun | undefined {
  return runs.find((run) => run.id === activeRunId) ?? runs[0];
}

/**
 * Updates or creates a step on the active workflow run.
 *
 * @param stepId Step identifier.
 * @param label Human-readable step label.
 * @param status New step status.
 * @param agentId Optional subagent id.
 */
export function updateActiveWorkflowStep(stepId: string, label: string, status: WorkflowStepStatus, agentId?: string): void {
  const run = getActiveWorkflowRun();
  if (!run) return;
  const now = Date.now();
  let step = run.steps.find((item) => item.id === stepId);
  if (!step) {
    step = { id: stepId, label, status: "pending", updatedAt: now };
    run.steps.push(step);
  }
  step.label = label;
  step.status = status;
  step.agentId = agentId ?? step.agentId;
  step.updatedAt = now;
  run.updatedAt = now;
  run.status = run.steps.some((item) => item.status === "error") ? "error" : run.steps.every((item) => item.status === "done") ? "done" : "running";
}
