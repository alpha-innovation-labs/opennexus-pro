import { createObservationListJsonRow } from "./createObservationListJsonRow";
import type { ObservationArtifactGroup, ObservationListJsonRow } from "./types";

/**
 * Builds machine-readable rows for observation groups.
 *
 * @param groups Observation artifact groups.
 * @returns JSON-safe rows.
 */
export async function createObservationListJsonRows(
	groups: readonly ObservationArtifactGroup[],
): Promise<ObservationListJsonRow[]> {
	return Promise.all(
		groups.map((group) => createObservationListJsonRow(group)),
	);
}
