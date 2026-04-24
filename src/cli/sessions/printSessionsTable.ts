import { buildSessionTableRows } from "./buildSessionTableRows.js";
import { formatSessionsTable } from "./formatSessionsTable.js";
import { listSessions } from "./listSessions.js";
import { readSessionTableTerminalWidth } from "./readSessionTableTerminalWidth.js";

/**
 * Prints resumable sessions to stdout as a table.
 *
 * @param cwd Working directory used for session lookup.
 * @param sessionDir Optional session directory override.
 * @returns A promise that resolves after printing finishes.
 */
export async function printSessionsTable(cwd: string, sessionDir?: string): Promise<void> {
  const sessions = await listSessions(cwd, sessionDir);
  console.log(formatSessionsTable(buildSessionTableRows(sessions), { terminalWidth: readSessionTableTerminalWidth() }));
}
