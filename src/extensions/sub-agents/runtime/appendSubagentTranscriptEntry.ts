import type { SubagentRun, SubagentTranscriptEntry } from "../types.js";

/**
 * Appends one transcript entry to a subagent run.
 *
 * @param run Target run.
 * @param entry Transcript entry.
 */
export function appendSubagentTranscriptEntry(run: SubagentRun, entry: Omit<SubagentTranscriptEntry, "createdAt">): void {
  run.transcript.push({ ...entry, createdAt: Date.now() });
}
