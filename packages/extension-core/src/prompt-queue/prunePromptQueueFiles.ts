import { readdir, rm } from "node:fs/promises";
import { join } from "node:path";

/**
 * Removes queue files whose session jsonl file no longer exists.
 *
 * @param queueDir Prompt queue storage directory.
 * @param sessionDir Pi/Nexus session directory.
 * @returns Session ids removed from prompt queue storage.
 */
export async function prunePromptQueueFiles(queueDir: string, sessionDir: string): Promise<string[]> {
  const [queueEntries, sessionEntries] = await Promise.all([
    readdir(queueDir).catch(() => []),
    readdir(sessionDir).catch(() => []),
  ]);
  const liveSessionIds = new Set(sessionEntries.flatMap((entry) => {
    const match = entry.match(/_(.+)\.jsonl$/u);
    return match?.[1] ? [match[1]] : [];
  }));
  const removed: string[] = [];
  for (const entry of queueEntries) {
    if (!entry.endsWith(".json")) continue;
    const sessionId = decodeURIComponent(entry.slice(0, -".json".length));
    if (liveSessionIds.has(sessionId)) continue;
    await rm(join(queueDir, entry), { force: true });
    removed.push(sessionId);
  }
  return removed.sort();
}
