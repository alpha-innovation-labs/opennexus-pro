import type { ResumeSessionStats } from "./readResumeSessionStats.js";
import { formatResumeAge } from "./formatResumeAge.js";

const HUMAN_ICON = "󰀄";
const TOOL_ICON = "󰍉";
const THINKING_ICON = "󰧑";

/**
 * Formats one resume-row metadata summary.
 *
 * @param stats Session stats for the active branch.
 * @param modified Session modified time.
 * @returns Compact summary text for the resume list.
 */
export function formatResumeSummary(stats: ResumeSessionStats, modified: Date): string {
  return [
    `${HUMAN_ICON} ${stats.humanMessages}`,
    `${TOOL_ICON} ${stats.toolCalls}`,
    `${THINKING_ICON} ${stats.thinkingBlocks}`,
    formatResumeAge(modified.getTime()),
  ].join(" · ");
}
