import { formatResumeAge } from "./formatResumeAge.js";
import { formatResumeSummary } from "./formatResumeSummary.js";
import { readResumeSessionStats } from "./readResumeSessionStats.js";
import type { SlashMenuLeaf } from "./types.js";

/**
 * Builds session resume leaves from session listings.
 *
 * @param sessions Session infos.
 * @returns Resume leaves.
 */
export function createResumeLeaves(sessions: Array<{ path: string; name?: string; cwd?: string; modified: Date }>): SlashMenuLeaf[] {
  return sessions
    .sort((left, right) => right.modified.getTime() - left.modified.getTime())
    .map((session) => ({
      kind: "session",
      label: session.name?.trim() || session.path.split("/").pop() || session.path,
      description: formatResumeSummary(readResumeSessionStats(session.path)),
      value: session.path,
      resumeAge: formatResumeAge(session.modified.getTime()),
    }));
}
