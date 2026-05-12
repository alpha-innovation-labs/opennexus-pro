import type { SessionInfo } from "@earendil-works/pi-coding-agent";

/**
 * Deduplicates session metadata records by file path while preserving order.
 *
 * @param sessions Session records returned by Pi's session registry.
 * @returns Unique session records keyed by persisted JSONL path.
 */
export function getUniqueSessionsByPath(sessions: readonly SessionInfo[]): SessionInfo[] {
  const seenPaths = new Set<string>();
  const uniqueSessions: SessionInfo[] = [];

  for (const session of sessions) {
    if (seenPaths.has(session.path)) continue;
    seenPaths.add(session.path);
    uniqueSessions.push(session);
  }

  return uniqueSessions;
}
