/**
 * Creates a compact workflow run id.
 *
 * @returns Workflow run id.
 */
export function createWorkflowRunId(): string {
  return `workflow-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
