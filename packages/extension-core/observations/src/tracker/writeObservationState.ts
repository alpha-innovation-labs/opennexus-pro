import { writeFile } from "node:fs/promises";
import { withFileMutationQueue } from "@earendil-works/pi-coding-agent";
import type { ObservationState } from "./types";
import { updateObservationSummary } from "./updateObservationSummary";

/**
 * Persists the structured observations state.
 *
 * @param statePath Observation state path.
 * @param state Observation state.
 */
export async function writeObservationState(
	statePath: string,
	state: ObservationState,
): Promise<void> {
	state.updatedAt = Date.now();
	updateObservationSummary(state);
	await withFileMutationQueue(statePath, async () => {
		await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
	});
}
