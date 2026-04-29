import { withFileMutationQueue } from "@mariozechner/pi-coding-agent";
import { writeFile } from "node:fs/promises";
import type { ObservationState } from "./types.js";
import { updateObservationSummary } from "./updateObservationSummary.js";

/**
 * Persists the structured observations state.
 *
 * @param statePath Observation state path.
 * @param state Observation state.
 */
export async function writeObservationState(statePath: string, state: ObservationState): Promise<void> {
	state.updatedAt = Date.now();
	updateObservationSummary(state);
	await withFileMutationQueue(statePath, async () => {
		await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
	});
}
