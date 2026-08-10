import type { ObservationState } from "@extensions/observations/tracker/types.js";

/**
 * Formats observation topics exactly like the modal left pane: titles only.
 *
 * @param state Observation state to format.
 * @returns Newline-delimited observation topic titles.
 */
export function formatObservationTopicList(state: Pick<ObservationState, "topics">): string {
	if (state.topics.length === 0) return "No observations yet.";
	return state.topics.map((topic) => topic.title).join("\n");
}
