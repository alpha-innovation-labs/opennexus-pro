import type { SessionInfo } from "@earendil-works/pi-coding-agent";
import type { SessionJsonRow } from "./SessionJsonRow";
import { formatSessionTitle } from "./formatSessionTitle";

/**
 * Converts session manager metadata into JSON-safe session rows.
 *
 * @param sessions Session metadata to serialize.
 * @returns Rows containing stable machine-readable session fields.
 */
export function createSessionJsonRows(sessions: readonly SessionInfo[]): SessionJsonRow[] {
  return sessions.map((session) => ({
    id: session.id,
    title: formatSessionTitle(session),
    cwd: session.cwd,
    path: session.path,
    created: session.created.toISOString(),
    modified: session.modified.toISOString(),
    messageCount: session.messageCount,
    firstMessage: session.firstMessage,
  }));
}
