import { basename } from "node:path";
import type { SessionInfo } from "@earendil-works/pi-coding-agent";

/**
 * Returns target ids accepted for recreating observations from one session.
 *
 * @param session Session metadata from Pi's session manager.
 * @returns Session id and filename-derived conversation id.
 */
export function getObservationRecreateSessionTargetIds(session: SessionInfo): string[] {
	const conversationId = basename(session.path).replace(/\.jsonl$/u, "");
	return conversationId === session.id ? [session.id] : [session.id, conversationId];
}
