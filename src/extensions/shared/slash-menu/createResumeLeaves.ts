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
      description: session.modified.toLocaleString(),
      value: session.path,
    }));
}
