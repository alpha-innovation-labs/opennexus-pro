import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { getAgentDir } from "@earendil-works/pi-coding-agent";
import { getDefaultDeleteSessionDir } from "./getDefaultDeleteSessionDir";

/**
 * Lists session directories that can contain a delete-session target.
 *
 * @param cwd Working directory used for local session lookup.
 * @param sessionDir Optional custom session directory.
 * @returns Unique directories to inspect by filename only.
 */
export async function listDeleteSessionSearchDirs(cwd: string, sessionDir?: string): Promise<string[]> {
  const dirs = new Set<string>([sessionDir ?? getDefaultDeleteSessionDir(cwd)]);
  const sessionsRoot = join(getAgentDir(), "sessions");

  try {
    const entries = await readdir(sessionsRoot, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) dirs.add(join(sessionsRoot, entry.name));
    }
  } catch {
    // Missing or unreadable global sessions root means only the local/custom directory can be searched.
  }

  return [...dirs];
}
