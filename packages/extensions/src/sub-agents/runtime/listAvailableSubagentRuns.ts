import type { SubagentRun } from "../types.js";
import { sharedSubagentRuntime } from "./sharedSubagentRuntime.js";
import { listPersistedSubagentRuns } from "./listPersistedSubagentRuns.js";

/**
 * Filters the subagent history view to the current parent session and folder.
 */
export type SubagentRunHistoryFilter = {
  cwd?: string;
  parentSessionFile?: string;
};

/**
 * Checks whether one run belongs to the requested history scope.
 *
 * @param run Run to evaluate.
 * @param filter Requested scope.
 * @returns True when the run is visible in the current history view.
 */
function matchesHistoryFilter(run: SubagentRun, filter?: SubagentRunHistoryFilter): boolean {
  if (!filter) return true;
  if (filter.cwd != null && run.cwd !== filter.cwd) return false;
  if (filter.parentSessionFile != null && run.parentSessionFile !== filter.parentSessionFile) return false;
  return true;
}

/**
 * Lists subagent runs from memory and persisted storage without duplicates.
 *
 * @param filter Optional history scope filter.
 * @returns Available subagent runs newest first.
 */
export async function listAvailableSubagentRuns(filter?: SubagentRunHistoryFilter): Promise<SubagentRun[]> {
	const mergedRuns = new Map<string, SubagentRun>();
	for (const run of await listPersistedSubagentRuns()) mergedRuns.set(run.id, run);
	for (const run of sharedSubagentRuntime.listRuns()) mergedRuns.set(run.id, run);
	return [...mergedRuns.values()].filter((run) => matchesHistoryFilter(run, filter)).sort((left, right) => right.createdAt - left.createdAt);
}
