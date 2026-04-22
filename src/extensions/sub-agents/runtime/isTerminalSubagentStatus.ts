import type { SubagentRun } from "../types.js";

/**
 * Reports whether one subagent run has reached a terminal state.
 *
 * @param status Current run status.
 * @returns True when no more work is expected.
 */
export function isTerminalSubagentStatus(status: SubagentRun["status"]): boolean {
  return status === "completed" || status === "error" || status === "aborted";
}
