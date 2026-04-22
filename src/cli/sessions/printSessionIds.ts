import { listSessionIds } from "./listSessionIds.js";

/**
 * Prints resumable session IDs to stdout, one per line.
 *
 * @param cwd Working directory used for session lookup.
 * @param sessionDir Optional session directory override.
 * @returns A promise that resolves after printing finishes.
 */
export async function printSessionIds(cwd: string, sessionDir?: string): Promise<void> {
  const sessionIds = await listSessionIds(cwd, sessionDir);
  for (const sessionId of sessionIds) {
    console.log(sessionId);
  }
}
