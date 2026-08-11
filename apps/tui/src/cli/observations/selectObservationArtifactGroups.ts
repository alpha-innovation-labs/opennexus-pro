import type { ObservationArtifactGroup } from "./types";

/**
 * Selects observation groups by the all target, conversation id, or session id.
 *
 * @param groups Available observation groups.
 * @param target Requested target.
 * @returns Matching groups.
 */
export function selectObservationArtifactGroups(
	groups: readonly ObservationArtifactGroup[],
	target: string,
): ObservationArtifactGroup[] {
	if (target === "all") return [...groups];
	return groups.filter(
		(group) =>
			group.conversationId === target ||
			group.sessionId === target ||
			group.sessionId.startsWith(target),
	);
}
