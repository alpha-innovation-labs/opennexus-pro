import type { SubagentRun } from "../types.js";
import { readPersistedSubagentRun } from "./readPersistedSubagentRun.js";
import { sharedSubagentRuntime } from "./sharedSubagentRuntime.js";

/**
 * Resolves one run from memory first, then persisted snapshots.
 *
 * @param runId Run identifier.
 * @returns Run state, if found.
 */
export async function getSubagentRun(runId: string): Promise<SubagentRun | undefined> {
  return sharedSubagentRuntime.getRun(runId) ?? await readPersistedSubagentRun(runId);
}
