import { SessionManager } from "@earendil-works/pi-coding-agent";
import type { DeleteSessionResolveResult } from "./DeleteSessionResolveResult.js";
import { getUniqueSessionsByPath } from "./getUniqueSessionsByPath.js";

/**
 * Resolves a session ID or unique ID prefix to one persisted session file.
 *
 * @param sessionReference Session ID or unique ID prefix to delete.
 * @param cwd Current working directory for local session lookup.
 * @param sessionDir Optional custom session directory.
 * @returns Resolution result for safe deletion.
 */
export async function resolveDeleteSessionTarget(
  sessionReference: string,
  cwd: string,
  sessionDir?: string,
): Promise<DeleteSessionResolveResult> {
  const localSessions = await SessionManager.list(cwd, sessionDir);
  const allSessions = await SessionManager.listAll();
  const sessions = getUniqueSessionsByPath([...localSessions, ...allSessions]);
  const exactMatches = sessions.filter((session) => session.id === sessionReference);
  const matches = exactMatches.length > 0 ? exactMatches : sessions.filter((session) => session.id.startsWith(sessionReference));

  if (matches.length === 0) return { type: "not_found", sessionReference };
  if (matches.length > 1) return { type: "ambiguous", sessionReference, matches };
  return { type: "found", session: matches[0]! };
}
