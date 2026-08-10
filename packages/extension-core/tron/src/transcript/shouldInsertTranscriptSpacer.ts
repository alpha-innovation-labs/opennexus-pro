import type { TranscriptEntry } from "./types.ts";

/**
 * Returns whether one transcript join should keep a blank separator line.
 *
 * @param entry Current transcript entry.
 * @param nextEntry Next transcript entry.
 * @returns True when the join should keep a spacer.
 */
export function shouldInsertTranscriptSpacer(entry: TranscriptEntry, nextEntry?: TranscriptEntry): boolean {
  if (entry.role === "tool" && nextEntry?.role === "tool") return false;
  return entry.role !== "thinking" && nextEntry?.role !== "thinking";
}
