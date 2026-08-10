import { createSessionJsonRows } from "./createSessionJsonRows";
import { formatSessionsJson } from "./formatSessionsJson";
import { listAllSessions } from "./listAllSessions";

/**
 * Prints all resumable sessions across known project directories to stdout as JSON.
 *
 * @returns A promise that resolves after printing finishes.
 */
export async function printAllSessionsJson(): Promise<void> {
  const sessions = await listAllSessions();
  console.log(formatSessionsJson(createSessionJsonRows(sessions)));
}
