import { Text } from "@earendil-works/pi-tui";
import type { Theme } from "./agent-widget.js";
import { renderWorkflowCard, type WorkflowCardInput } from "./workflow-card.js";

export interface WorkflowToolInput extends WorkflowCardInput {
  error?: string;
  outcome?: string;
}

/** Resolve live task data at render time, including after the launch tool has settled. */
export function renderWorkflowToolResult(
  text: string,
  getInput: () => WorkflowToolInput | undefined,
  expanded: boolean,
  isError: boolean,
  theme: Theme,
) {
  return {
    render(width: number): string[] {
      const input = isError ? undefined : getInput();
      // Historical/validation results must not depend on a live workflow map.
      if (!input) return new Text(text, 0, 0).render(width);
      if (!expanded) {
        return [
          ...renderWorkflowCard({ ...input, width, compact: true }, theme).render(width),
          ...(input.error !== undefined ? new Text(theme.fg("error", input.error), 0, 0).render(width) : []),
        ];
      }
      return [
        ...renderWorkflowCard({ ...input, width }, theme).render(width),
        ...new Text("  /agents → Workflows to inspect", 0, 0).render(width),
        ...new Text(input.error ?? input.outcome ?? text, 0, 0).render(width),
      ];
    },
    invalidate() {}, // No cached task, clock, width or theme-derived rows.
  };
}
