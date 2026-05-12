import { createSessionJsonRows } from "./createSessionJsonRows.js";
import { formatSessionsJson } from "./formatSessionsJson.js";
import { listAllSessions } from "./listAllSessions.js";

/**
 * Prints all resumable sessions across known project directories to stdout as JSON.
 *
 * @returns A promise that resolves after printing finishes.
 */
export async function printAllSessionsJson(): Promise<void> {
  const sessions = await listAllSessions();
  console.log(formatSessionsJson(createSessionJsonRows(sessions)));
}
