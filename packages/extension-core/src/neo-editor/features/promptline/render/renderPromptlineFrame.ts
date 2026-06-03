import { getUsageTextForModel } from "@nexus/extensions/slashusage/index.js";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { renderBottomBorderLabel } from "../../../shared/ui/renderBottomBorderLabel.js";
import { renderUsageText } from "../../../shared/ui/renderUsageText.js";
import { getGitState } from "../../../shared/git/state.js";
import { extractEditorContentLines } from "../extractEditorContentLines.js";
import { getPromptlineModel } from "../getPromptlineModel.js";
import { padToWidth } from "../padToWidth.js";
import { prefixEditorLine } from "../prefixEditorLine.js";
import { buildPromptline } from "./buildPromptline.js";
import { getCachedContextUsage } from "./getCachedContextUsage.js";
import { renderPromptlineBorder } from "./renderPromptlineBorder.js";

interface PromptlineFrameChromeCache {
  key: string;
  top: string;
  bottom: string;
}

let promptlineFrameChromeCache: PromptlineFrameChromeCache | undefined;

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
  const model = getPromptlineModel(ctx);
  const usage = getCachedContextUsage(ctx);
  const gitState = getGitState();
  const thinking = getThinkingLevel();
  const usageText = renderUsageText(uiTheme, getUsageTextForModel(model));
  const chromeKey = [
    innerWidth,
    ctx.cwd,
    model?.id ?? "",
    model?.contextWindow ?? "",
    thinking,
    gitState.branch ?? "",
    gitState.dirtyCount,
    gitState.ahead,
    gitState.behind,
    usage?.tokens ?? "",
    usage?.percent ?? "",
    usage?.contextWindow ?? "",
    usageText,
  ].join("\u001f");
  let chrome = promptlineFrameChromeCache;
  if (chrome?.key !== chromeKey) {
    chrome = {
      key: chromeKey,
      top: borderColor("╭")
        + renderPromptlineBorder(borderColor, uiTheme, innerWidth, buildPromptline(ctx, uiTheme, () => thinking, innerWidth))
        + borderColor("╮"),
      bottom: borderColor("╰")
        + renderBottomBorderLabel(borderColor, uiTheme, innerWidth, usageText)
        + borderColor("╯"),
    };
    promptlineFrameChromeCache = chrome;
  }
  const contentLines = editorContent.map((entry) => padToWidth(entry, innerWidth));

  if (contentLines.length > 0) {
    contentLines[0] = prefixEditorLine(contentLines[0]!.replace(/^\s+/, ""), innerWidth, "» ", (text) => uiTheme.fg("error" as any, text));
  }

  return [
    chrome.top,
    ...contentLines.map((entry) => borderColor("│") + padToWidth(entry, innerWidth) + borderColor("│")),
    chrome.bottom,
  ];
}
