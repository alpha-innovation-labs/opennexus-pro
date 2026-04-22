import type { SlashMenuLeaf } from "./types.js";

/**
 * Builds tree summary choice leaves.
 *
 * @returns Summary leaves.
 */
export function createTreeSummaryLeaves(): SlashMenuLeaf[] {
  return [
    { kind: "choice", label: "No summary", description: "Navigate directly without summarizing the abandoned branch.", value: "nosummary" },
    { kind: "choice", label: "Summarize", description: "Summarize the abandoned branch before switching.", value: "summary" },
    { kind: "choice", label: "Summarize with custom prompt", description: "Write custom summarization instructions before switching.", value: "custom-summary" },
  ];
}
