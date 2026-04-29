import type { ObservationState } from "./types.js";
import { truncateObservationSummary } from "./truncateObservationSummary.js";

/**
 * Builds a compact one-paragraph summary across all observation topics.
 *
 * @param state Observation state to summarize.
 * @returns Session-wide observation summary capped for modal display.
 */
export function buildObservationSummary(state: Pick<ObservationState, "topics">): string {
	const topicSummaries = state.topics.map((topic) => {
		const details = [...topic.assistantBullets, ...topic.userMessages].filter((item) => item.trim().length > 0);
		return details.length > 0 ? `${topic.title}: ${details.join("; ")}` : topic.title;
	});
	return truncateObservationSummary(topicSummaries.join(". "));
}
