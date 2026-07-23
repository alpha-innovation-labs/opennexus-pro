import type { SubagentRun } from "../types.js";

/**
 * Formats one tool result payload for the parent agent.
 *
 * @param run Completed or running run.
 * @returns Tool text result.
 */
export function formatSubagentResult(run: SubagentRun): { content: [{ type: "text"; text: string }] } {
  const lines = [
    `agent_id: ${run.id}`,
    `status: ${run.status}`,
    `title: ${run.title}`,
    `cwd: ${run.cwd || "(unknown)"}`,
  ];
  if (run.resultText.trim()) {
    lines.push("", run.resultText.trim());
  }
  if (run.lastError) {
    lines.push("", `error: ${run.lastError}`);
  }
  return { content: [{ type: "text", text: lines.join("\n") }] };
}
