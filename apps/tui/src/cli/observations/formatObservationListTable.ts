import Table from "cli-table3";
import type { ObservationListJsonRow } from "./types";

/**
 * Formats observation rows as a human-readable table.
 *
 * @param rows Observation rows.
 * @returns Table output.
 */
export function formatObservationListTable(
	rows: readonly ObservationListJsonRow[],
): string {
	if (rows.length === 0) return "No observations found.";
	const table = new Table({
		head: ["Session ID", "Msgs", "Topics", "Files", "Updated"],
		wordWrap: true,
		wrapOnWordBoundary: false,
		style: { head: [], border: [] },
	});
	for (const row of rows) {
		table.push([
			row.sessionId,
			String(row.messageCount),
			String(row.topicCount),
			formatFiles(row),
			row.updatedAt ?? "-",
		]);
	}
	return table.toString();
}

/**
 * Formats artifact presence flags for one observation row.
 *
 * @param row Observation row.
 * @returns Compact artifact presence string.
 */
function formatFiles(row: ObservationListJsonRow): string {
	return [
		row.hasMessages ? "messages" : "missing-messages",
		row.hasState ? "state" : "missing-state",
		row.hasMarkdown ? "markdown" : "missing-markdown",
	].join(",");
}
