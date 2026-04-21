import type { SubagentRun } from "../types.js";

/**
 * Chooses the best live text snippet for a run widget.
 *
 * @param run Target run.
 * @returns Text to render in the compact status widget.
 */
export function getSubagentDisplayText(run: SubagentRun): string {
  if (run.activeTool?.outputText.trim()) return run.activeTool.outputText.trim();
  if (run.activeTool) return run.activeTool.toolName;
  if (run.liveThinkingText.trim()) return run.liveThinkingText.trim();
  if (run.liveAssistantText.trim()) return run.liveAssistantText.trim();
  return run.resultText.trim() || run.status;
}
