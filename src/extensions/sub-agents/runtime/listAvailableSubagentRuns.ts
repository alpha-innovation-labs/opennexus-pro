import type { SubagentRun } from "../types.js";
import { sharedSubagentRuntime } from "./sharedSubagentRuntime.js";
import { listPersistedSubagentRuns } from "./listPersistedSubagentRuns.js";

/**
 * Lists subagent runs from memory and persisted storage without duplicates.
 *
 * @returns Available subagent runs newest first.
 */
export async function listAvailableSubagentRuns(): Promise<SubagentRun[]> {
	const mergedRuns = new Map<string, SubagentRun>();
	for (const run of await listPersistedSubagentRuns()) mergedRuns.set(run.id, run);
	for (const run of sharedSubagentRuntime.listRuns()) mergedRuns.set(run.id, run);
	return [...mergedRuns.values()].sort((left, right) => right.createdAt - left.createdAt);
}
