import type { SessionInfo } from "@mariozechner/pi-coding-agent";
import type { SessionTableRow } from "./SessionTableRow.js";
import { formatSessionDate } from "./formatSessionDate.js";
import { formatSessionTitle } from "./formatSessionTitle.js";

/**
 * Converts session manager metadata into printable table rows.
 *
 * @param sessions Session metadata to display.
 * @returns Rows containing date, title, and session ID strings.
 */
export function buildSessionTableRows(sessions: SessionInfo[]): SessionTableRow[] {
  return sessions.map((session) => ({
    date: formatSessionDate(session.modified),
    title: formatSessionTitle(session),
    id: session.id,
  }));
}
