import { calculateSessionTableColumnWidths } from "./calculateSessionTableColumnWidths";
import { createSessionsCliTable } from "./createSessionsCliTable";
import { formatSessionTableCell } from "./formatSessionTableCell";
import type { SessionTableFormatOptions } from "./SessionTableFormatOptions";
import type { SessionTableRow } from "./SessionTableRow";

/**
 * Renders session rows as a responsive unicode CLI table using cli-table3.
 *
 * @param rows Session rows to render.
 * @param options Layout options for terminal-width-aware wrapping.
 * @returns Table text with date, session title, and session ID columns.
 */
export function formatSessionsTable(
	rows: SessionTableRow[],
	options: SessionTableFormatOptions = {},
): string {
	const columnWidths = calculateSessionTableColumnWidths(options.terminalWidth);
	const table = createSessionsCliTable(columnWidths);

	for (const row of rows) {
		table.push([
			formatSessionTableCell(row.date),
			formatSessionTableCell(row.title),
			formatSessionTableCell(row.id),
		]);
	}

	return table.toString();
}
