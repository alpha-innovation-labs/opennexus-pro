import { iconForToolName } from "../../tron/compact-tool-lines/iconForToolName.ts";
import { summarizeArgs } from "../../tron/compact-tool-lines/summarizeArgs.ts";
import type { SubagentRun } from "../../sub-agents/types.js";
import { getSubagentDisplayText } from "../../sub-agents/runtime/getSubagentDisplayText.js";
import { sanitizeWidgetPreview } from "./sanitizeWidgetPreview.js";

/**
 * Builds the active tool label and preview text for one subagent widget row.
 *
 * @param run Target run.
 * @returns Tool icon, label, and summary.
 */
export function getWidgetToolSummary(run: SubagentRun): { icon: string; label: string; summary: string } {
  if (!run.activeTool) {
    const fallback = sanitizeWidgetPreview(getSubagentDisplayText(run)) || "thinking…";
    return { icon: "󰧑", label: "thinking", summary: fallback };
  }

  const outputPreview = sanitizeWidgetPreview(run.activeTool.outputText);
  if (outputPreview) {
    return {
      icon: iconForToolName(run.activeTool.toolName),
      label: run.activeTool.toolName,
      summary: outputPreview,
    };
  }

  const summary = summarizeArgs(run.activeTool.toolName, run.activeTool.args ?? {});
  const parts = [summary.main, summary.options, summary.inlineStats].filter(Boolean).join(" ").trim();
  return {
    icon: iconForToolName(run.activeTool.toolName),
    label: run.activeTool.toolName,
    summary: sanitizeWidgetPreview(parts),
  };
}
