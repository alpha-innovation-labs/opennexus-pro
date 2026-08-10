import type { SessionTableColumnWidths } from "./SessionTableColumnWidths";

const DATE_COLUMN_WIDTH = 21;
const SESSION_ID_COLUMN_WIDTH = 38;
const MIN_TITLE_COLUMN_WIDTH = 16;
const MIN_WRAPPED_ID_COLUMN_WIDTH = 18;
const TABLE_BORDER_WIDTH = 4;
const DEFAULT_TERMINAL_WIDTH = 120;
const MIN_TABLE_WIDTH = DATE_COLUMN_WIDTH + MIN_TITLE_COLUMN_WIDTH + MIN_WRAPPED_ID_COLUMN_WIDTH + TABLE_BORDER_WIDTH;

/**
 * Calculates cli-table3 column widths that fit within a terminal width.
 *
 * @param terminalWidth Current terminal width in columns.
 * @returns Column widths for date, title, and session ID.
 */
export function calculateSessionTableColumnWidths(terminalWidth?: number): SessionTableColumnWidths {
  const safeTerminalWidth = Math.max(MIN_TABLE_WIDTH, Math.floor(terminalWidth ?? DEFAULT_TERMINAL_WIDTH));
  const fullIdLayoutTitleWidth = safeTerminalWidth - DATE_COLUMN_WIDTH - SESSION_ID_COLUMN_WIDTH - TABLE_BORDER_WIDTH;

  if (fullIdLayoutTitleWidth >= MIN_TITLE_COLUMN_WIDTH) {
    return {
      date: DATE_COLUMN_WIDTH,
      title: fullIdLayoutTitleWidth,
      id: SESSION_ID_COLUMN_WIDTH,
    };
  }

  return {
    date: DATE_COLUMN_WIDTH,
    title: MIN_TITLE_COLUMN_WIDTH,
    id: Math.max(MIN_WRAPPED_ID_COLUMN_WIDTH, safeTerminalWidth - DATE_COLUMN_WIDTH - MIN_TITLE_COLUMN_WIDTH - TABLE_BORDER_WIDTH),
  };
}
