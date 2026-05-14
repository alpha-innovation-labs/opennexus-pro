import { createObservationListJsonRow } from "./createObservationListJsonRow.js";
import type { ObservationArtifactGroup, ObservationListJsonRow } from "./types.js";

/**
 * Builds machine-readable rows for observation groups.
 *
 * @param groups Observation artifact groups.
 * @returns JSON-safe rows.
 */
export async function createObservationListJsonRows(
  groups: readonly ObservationArtifactGroup[],
): Promise<ObservationListJsonRow[]> {
  return Promise.all(groups.map((group) => createObservationListJsonRow(group)));
}
