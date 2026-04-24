import Table from "cli-table3";
import type { SessionTableColumnWidths } from "./SessionTableColumnWidths.js";

const TABLE_HEAD = ["Date", "Session title", "Session ID"];

/**
 * Creates the CLI table renderer used for session output.
 *
 * @param columnWidths Widths for the date, title, and session ID columns.
 * @returns A cli-table3 table configured for deterministic uncolored wrapping.
 */
export function createSessionsCliTable(columnWidths: SessionTableColumnWidths): Table.Table {
  return new Table({
    head: TABLE_HEAD,
    colWidths: [columnWidths.date, columnWidths.title, columnWidths.id],
    wordWrap: true,
    wrapOnWordBoundary: false,
    style: {
      head: [],
      border: [],
    },
  });
}
