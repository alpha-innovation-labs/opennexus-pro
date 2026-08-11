import {
	type SessionInfo,
	SessionManager,
} from "@earendil-works/pi-coding-agent";
import { getUniqueSessionsByPath } from "../delete-session/getUniqueSessionsByPath";

/**
 * Lists sessions eligible for observation recreation.
 *
 * @param cwd Current working directory.
 * @param sessionDir Optional custom session directory.
 * @returns Unique session metadata.
 */
export async function listObservationRecreateSessions(
	cwd: string,
	sessionDir?: string,
): Promise<SessionInfo[]> {
	const localSessions = await SessionManager.list(cwd, sessionDir);
	const allSessions = sessionDir ? [] : await SessionManager.listAll();
	return getUniqueSessionsByPath([...localSessions, ...allSessions]);
}
