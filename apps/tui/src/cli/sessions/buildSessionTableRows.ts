import type { SessionInfo } from "@earendil-works/pi-coding-agent";
import { formatSessionDate } from "./formatSessionDate";
import { formatSessionTitle } from "./formatSessionTitle";
import type { SessionTableRow } from "./SessionTableRow";

/**
 * Converts session manager metadata into printable table rows.
 *
 * @param sessions Session metadata to display.
 * @returns Rows containing date, title, and session ID strings.
 */
export function buildSessionTableRows(
	sessions: SessionInfo[],
): SessionTableRow[] {
	return sessions.map((session) => ({
		date: formatSessionDate(session.modified),
		title: formatSessionTitle(session),
		id: session.id,
	}));
}
