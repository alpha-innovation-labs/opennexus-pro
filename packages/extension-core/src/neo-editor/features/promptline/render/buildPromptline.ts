import { homedir } from "node:os";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { getGitState } from "../../../shared/git/state.js";
import { getPromptlineModel } from "../getPromptlineModel.js";
import { buildContextBar } from "./buildContextBar.js";
import { PRIMARY_COLOR, RESET } from "./constants.js";
import { formatContextTokenUsage } from "./formatContextTokenUsage.js";
import { getCachedContextUsage } from "./getCachedContextUsage.js";
import { getContextColor } from "./getContextColor.js";
import { truncateFromStart } from "./truncateFromStart.js";

/**
 * Builds the promptline left and right display segments.
 *
 * @param ctx Extension context.
 * @param uiTheme UI theme.
 * @param getThinkingLevel Thinking-level getter.
 * @param width Available width.
 * @returns Promptline segments.
 */
export async function buildPromptline(
  ctx: ExtensionContext,
  uiTheme: ExtensionContext["ui"]["theme"],
  getThinkingLevel: ExtensionAPI["getThinkingLevel"],
  width?: number,
): { left: string; right: string } {
  const usage = getCachedContextUsage(ctx);
  const currentModel = getPromptlineModel(ctx);
  const _thinking = getThinkingLevel();
  const branch = getGitState().branch;

  const separator = uiTheme.fg("dim", " › ");
  const segments: string[] = [];
  const maxPathWidth = Math.max(12, Math.floor((width ?? 80) * 0.8));
  const home = homedir();
  const displayCwd = ctx.cwd.startsWith(home) ? `~${ctx.cwd.slice(home.length)}` : ctx.cwd;
  const folderIcon = uiTheme.fg(PRIMARY_COLOR as any, "");
  const locationPath = truncateFromStart(displayCwd, Math.max(1, maxPathWidth - 2), "…");
  const location = `${folderIcon} ${uiTheme.fg(PRIMARY_COLOR as any, locationPath)}`;
  segments.push(location);

  const gitState = getGitState();
  if (branch) {
    let branchSegment = uiTheme.fg("syntaxFunction", branch);
    if (gitState.dirtyCount > 0) branchSegment += uiTheme.fg("warning", ` ✱${gitState.dirtyCount}`);
    if (gitState.ahead > 0 || gitState.behind > 0) {
      const arrows: string[] = [];
      if (gitState.ahead > 0) arrows.push(`↑${gitState.ahead}`);
      if (gitState.behind > 0) arrows.push(`↓${gitState.behind}`);
      branchSegment += uiTheme.fg("muted", ` ${arrows.join(" ")} `);
    }
    segments.push(branchSegment);
  }

  const contextWindow = usage?.contextWindow ?? currentModel?.contextWindow ?? 0;
  const rawTokens = typeof usage?.tokens === "number" ? usage.tokens : typeof usage?.percent === "number" && contextWindow > 0 ? Math.round((usage.percent / 100) * contextWindow) : 0;
  const fallbackReport = await createContextUsageReport(createRuntimeSnapshot(ctx));
  const currentContextTokens = rawTokens === 0 && fallbackReport.usedTokens !== null
    ? fallbackReport.usedTokens
    : rawTokens;
  const tokenUsage = formatContextTokenUsage(currentContextTokens, contextWindow);
  const contextBar = buildContextBar(usage?.percent);
  const contextColor = getContextColor(usage?.percent);
  return {
    left: segments.flatMap((segment, index) => (index === 0 ? [segment] : [separator, segment])).join(""),
    right: ` ${contextColor} ${contextBar} ${tokenUsage}${RESET}`,
  };
}
