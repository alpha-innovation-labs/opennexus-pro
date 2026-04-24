import { createWorkflowRunId } from "./createWorkflowRunId.js";
import type { WorkflowDefinition, WorkflowRun } from "./types.js";

/**
 * Creates an in-memory workflow run record.
 *
 * @param definition Workflow definition being started.
 * @param request Optional user request for the workflow.
 * @returns New workflow run.
 */
export function createWorkflowRun(definition: WorkflowDefinition, request?: string): WorkflowRun {
  const now = Date.now();
  return {
    id: createWorkflowRunId(),
    workflowId: definition.id,
    workflowName: definition.name,
    status: "running",
    createdAt: now,
    updatedAt: now,
    request,
    steps: [
      { id: "librarian", label: "Librarian", status: "pending", updatedAt: now },
      { id: "implementation", label: "Coder", status: "pending", updatedAt: now },
      { id: "e2e", label: "E2E", status: "pending", updatedAt: now },
      { id: "qa", label: "QA", status: "pending", updatedAt: now },
      { id: "merge", label: "Merge", status: "pending", updatedAt: now },
    ],
  };
}
