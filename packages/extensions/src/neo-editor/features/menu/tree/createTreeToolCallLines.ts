import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { renderEditChangeStats } from "../../../../tron/compact-tool-lines/renderEditChangeStats.js";
import { summarizeArgs } from "../../../../tron/compact-tool-lines/summarizeArgs.js";
import { CompactToolRow } from "../../../../tron/shared/compact-row/CompactToolRow.js";
import { previewContent } from "../../../../tron/toolcalls/previewContent.js";
import { toolIcon } from "../../../../tron/toolcalls/toolIcon.js";
import type { ToolCallBlock } from "../../../../tron/toolcalls/types.js";

const TOOL_ROW_WIDTH = 88;

/**
 * Creates Tron-style compact rendered lines for a tree tool call.
 *
 * @param toolCall Tool-call content block.
 * @param resultContent Tool result content.
 * @param theme UI theme.
 * @param showTopBorder Whether to render the top border.
 * @param showBottomBorder Whether to render the bottom border.
 * @returns Rendered tool-call block lines.
 */
export function createTreeToolCallLines(
  toolCall: ToolCallBlock,
  resultContent: unknown,
  theme: ExtensionCommandContext["ui"]["theme"],
  showTopBorder: boolean,
  showBottomBorder: boolean,
): string[] {
  const summary = summarizeArgs(toolCall.name as never, toolCall.arguments);
  const themedSummary = ["edit", "write"].includes(toolCall.name) ? renderEditChangeStats(summary, theme) : summary;
  const resultPreview = resultContent === undefined ? "" : previewContent(resultContent);
  return new CompactToolRow({
    width: TOOL_ROW_WIDTH,
    icon: toolIcon(toolCall.name),
    label: toolCall.name,
    main: resultPreview || themedSummary.main,
    inlineStats: themedSummary.inlineStats,
    renderedInlineStats: themedSummary.renderedInlineStats,
    options: themedSummary.options,
    renderedOptions: themedSummary.renderedOptions,
    theme,
    showTopBorder,
    showBottomBorder,
  }).render().map((line) => `  ${line}`);
}
