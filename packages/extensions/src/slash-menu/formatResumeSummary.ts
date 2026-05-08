import type { ResumeSessionStats } from "./readResumeSessionStats.js";
const HUMAN_ICON = "󰀄";
const TOOL_ICON = "󰍉";
const THINKING_ICON = "󰧑";

/**
 * Formats one resume-row metadata summary.
 *
 * @param stats Session stats for the active branch.
 * @returns Compact summary text for the resume list.
 */
export function formatResumeSummary(stats: ResumeSessionStats): string {
  return [
    `${HUMAN_ICON} ${stats.humanMessages}`,
    `${TOOL_ICON} ${stats.toolCalls}`,
    `${THINKING_ICON} ${stats.thinkingBlocks}`,
  ].join(" · ");
}
