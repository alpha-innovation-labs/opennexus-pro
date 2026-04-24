import { getWorkflowOrchestratorPrompt } from "../logic/getWorkflowOrchestratorPrompt.js";
import type { WorkflowDefinition, WorkflowRun } from "../state/types.js";

/**
 * Builds the user message that instructs the current agent to start a workflow.
 *
 * @param definition Selected workflow definition.
 * @param run Created workflow run.
 * @param request Optional user request.
 * @returns Prompt sent to the current agent.
 */
export function createWorkflowStartRequest(definition: WorkflowDefinition, run: WorkflowRun, request?: string): string {
  const subject = request?.trim() || "Ask the user what feature or bug fix they want to run through this workflow.";
  return `${getWorkflowOrchestratorPrompt(subject)}\n\nWorkflow run id: ${run.id}\nSelected workflow: ${definition.name}`;
}
