import type { WorkflowStep } from "./types.js";

/**
 * Formats one workflow step with a status icon.
 *
 * @param step Workflow step.
 * @returns Display line.
 */
export function getWorkflowStepDisplay(step: WorkflowStep): string {
  const icon = step.status === "done" ? "✓" : step.status === "running" ? "◌" : step.status === "error" ? "✗" : "○";
  return `  - ${step.label} ${icon}`;
}
