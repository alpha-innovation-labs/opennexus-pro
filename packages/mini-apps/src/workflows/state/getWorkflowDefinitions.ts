import type { WorkflowDefinition } from "./types.js";

/**
 * Returns workflow definitions available from /workflow-start.
 *
 * @returns Available workflow definitions.
 */
export function getWorkflowDefinitions(): WorkflowDefinition[] {
  return [
    {
      id: "coding",
      name: "Coding workflow",
      description: "Librarian context discovery, Engineer implementation, e2e, QA, human feedback, final context, merge.",
    },
  ];
}
