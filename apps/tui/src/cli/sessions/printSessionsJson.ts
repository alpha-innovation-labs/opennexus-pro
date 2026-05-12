import { createSessionJsonRows } from "./createSessionJsonRows.js";
import { formatSessionsJson } from "./formatSessionsJson.js";
import { listSessions } from "./listSessions.js";

/**
 * Prints resumable sessions for one working directory to stdout as JSON.
 *
 * @param cwd Working directory used for session lookup.
 * @param sessionDir Optional session directory override.
 * @returns A promise that resolves after printing finishes.
 */
export async function printSessionsJson(cwd: string, sessionDir?: string): Promise<void> {
  const sessions = await listSessions(cwd, sessionDir);
  console.log(formatSessionsJson(createSessionJsonRows(sessions)));
}
