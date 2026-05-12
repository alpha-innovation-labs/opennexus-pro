import { buildSessionTableRows } from "./buildSessionTableRows.js";
import { formatSessionsTable } from "./formatSessionsTable.js";
import { listAllSessions } from "./listAllSessions.js";
import { readSessionTableTerminalWidth } from "./readSessionTableTerminalWidth.js";

/**
 * Prints all resumable sessions across known project directories to stdout as a table.
 *
 * @returns A promise that resolves after printing finishes.
 */
export async function printAllSessionsTable(): Promise<void> {
  const sessions = await listAllSessions();
  console.log(formatSessionsTable(buildSessionTableRows(sessions), { terminalWidth: readSessionTableTerminalWidth() }));
}
