import { buildSessionTableRows } from "./buildSessionTableRows";
import { formatSessionsTable } from "./formatSessionsTable";
import { listAllSessions } from "./listAllSessions";
import { readSessionTableTerminalWidth } from "./readSessionTableTerminalWidth";

/**
 * Prints all resumable sessions across known project directories to stdout as a table.
 *
 * @returns A promise that resolves after printing finishes.
 */
export async function printAllSessionsTable(): Promise<void> {
  const sessions = await listAllSessions();
  console.log(formatSessionsTable(buildSessionTableRows(sessions), { terminalWidth: readSessionTableTerminalWidth() }));
}
