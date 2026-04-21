import { readdir } from "node:fs/promises";
import type { SubagentRun } from "../types.js";
import { ensureSubagentStorageDir } from "./ensureSubagentStorageDir.js";
import { readPersistedSubagentRun } from "./readPersistedSubagentRun.js";

/**
 * Lists persisted subagent runs newest first.
 *
 * @returns Persisted runs available on disk.
 */
export async function listPersistedSubagentRuns(): Promise<SubagentRun[]> {
	try {
		const entries = await readdir(ensureSubagentStorageDir(), { withFileTypes: true });
		const runIds = entries
			.filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
			.map((entry) => entry.name.replace(/\.json$/u, ""));
		const runs = (await Promise.all(runIds.map((runId) => readPersistedSubagentRun(runId)))).filter((run): run is SubagentRun => Boolean(run));
		return runs.sort((left, right) => right.createdAt - left.createdAt);
	} catch {
		return [];
	}
}
