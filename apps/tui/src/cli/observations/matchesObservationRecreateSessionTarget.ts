import type { SessionInfo } from "@earendil-works/pi-coding-agent";
import { getObservationRecreateSessionTargetIds } from "./getObservationRecreateSessionTargetIds";

/**
 * Checks whether a session matches an observations recreate target.
 *
 * @param session Session metadata from Pi's session manager.
 * @param target User-supplied session id or filename-derived conversation id.
 * @param exact Whether the match must be exact instead of prefix-based.
 * @returns True when the session matches the requested target.
 */
export function matchesObservationRecreateSessionTarget(
	session: SessionInfo,
	target: string,
	exact: boolean,
): boolean {
	const targetIds = getObservationRecreateSessionTargetIds(session);
	return exact
		? targetIds.includes(target)
		: targetIds.some((targetId) => targetId.startsWith(target));
}
