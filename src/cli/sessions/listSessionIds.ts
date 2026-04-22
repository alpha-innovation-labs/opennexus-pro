import { SessionManager } from "@mariozechner/pi-coding-agent";

/**
 * Lists resumable session IDs for one working directory.
 *
 * @param cwd Working directory used for session lookup.
 * @param sessionDir Optional session directory override.
 * @returns Session IDs sorted by most recently modified first.
 */
export async function listSessionIds(cwd: string, sessionDir?: string): Promise<string[]> {
  const sessions = await SessionManager.list(cwd, sessionDir);
  return sessions.map((session) => session.id);
}
