import {
	type SessionInfo,
	SessionManager,
} from "@earendil-works/pi-coding-agent";
import { sortSessionsByModifiedTime } from "./sortSessionsByModifiedTime";

/**
 * Lists resumable sessions across all known project directories.
 *
 * @returns Session metadata sorted by oldest modified first.
 */
export async function listAllSessions(): Promise<SessionInfo[]> {
	const sessions = await SessionManager.listAll();
	return sortSessionsByModifiedTime(sessions);
}
