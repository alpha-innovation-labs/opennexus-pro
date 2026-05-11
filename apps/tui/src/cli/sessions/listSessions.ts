import { SessionManager, type SessionInfo } from "@earendil-works/pi-coding-agent";

/**
 * Lists resumable sessions for one working directory.
 *
 * @param cwd Working directory used for session lookup.
 * @param sessionDir Optional session directory override.
 * @returns Session metadata sorted by oldest modified first.
 */
export async function listSessions(cwd: string, sessionDir?: string): Promise<SessionInfo[]> {
  const sessions = await SessionManager.list(cwd, sessionDir);
  return sessions.sort((first, second) => first.modified.getTime() - second.modified.getTime());
}
