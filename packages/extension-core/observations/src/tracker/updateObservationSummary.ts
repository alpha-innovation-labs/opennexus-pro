import { buildObservationSummary } from "./buildObservationSummary";
import type { ObservationState } from "./types";

/**
 * Refreshes the persisted session-wide observation summary.
 *
 * @param state Observation state to update.
 * @returns The same state instance with an updated summary.
 */
export function updateObservationSummary(state: ObservationState): ObservationState {
	state.summary = buildObservationSummary(state);
	return state;
}
