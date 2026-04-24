import { getUsageTextForModel } from "../../../../slash-usage/index.js";
import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { renderBottomBorderLabel } from "../../ui/renderBottomBorderLabel.js";
import { renderUsageText } from "../../ui/renderUsageText.js";
import { extractEditorContentLines } from "../extractEditorContentLines.js";
import { padToWidth } from "../padToWidth.js";
import { prefixEditorLine } from "../prefixEditorLine.js";
import { buildPromptline } from "./buildPromptline.js";
import { renderPromptlineBorder } from "./renderPromptlineBorder.js";

/**
 * Renders the custom promptline frame around the base editor output.
 *
 * @param baseLines Base editor render output.
 * @param width Full target width.
 * @param borderColor Border color callback.
 * @param uiTheme Nexus UI theme.
 * @param ctx Extension context.
 * @param getThinkingLevel Thinking-level getter.
 * @returns Rendered promptline lines.
 */
export function renderPromptlineFrame(
  baseLines: string[],
  width: number,
  borderColor: (text: string) => string,
  uiTheme: ExtensionContext["ui"]["theme"],
  ctx: ExtensionContext,
  getThinkingLevel: ExtensionAPI["getThinkingLevel"],
): string[] {
  if (baseLines.length === 0) return baseLines;

  const innerWidth = Math.max(1, width - 2);
  const editorContent = extractEditorContentLines(baseLines);
  const top = borderColor("╭")
    + renderPromptlineBorder(borderColor, uiTheme, innerWidth, buildPromptline(ctx, uiTheme, getThinkingLevel, innerWidth))
    + borderColor("╮");
  const bottom = borderColor("╰")
    + renderBottomBorderLabel(borderColor, uiTheme, innerWidth, renderUsageText(uiTheme, getUsageTextForModel(ctx.model)))
    + borderColor("╯");
  const contentLines = editorContent.map((entry) => padToWidth(entry, innerWidth));

  if (contentLines.length > 0) {
    contentLines[0] = prefixEditorLine(contentLines[0]!.replace(/^\s+/, ""), innerWidth, "» ", (text) => uiTheme.fg("error" as any, text));
  }

  return [
    top,
    ...contentLines.map((entry) => borderColor("│") + padToWidth(entry, innerWidth) + borderColor("│")),
    bottom,
  ];
}
