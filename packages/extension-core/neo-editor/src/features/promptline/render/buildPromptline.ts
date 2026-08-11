import { homedir } from "node:os";
import type { AssistantMessage, UserMessage } from "@earendil-works/pi-ai";
import type {
	ExtensionAPI,
	ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import { estimateTokensFromText } from "@extensions/context-usage/estimateTokensFromText";
import { getStartupContextReport } from "../../../registerNeoEditorExtension";
import { getGitState } from "../../../shared/git/state";
import { getPromptlineModel } from "../getPromptlineModel";
import { buildContextBar } from "./buildContextBar";
import { PRIMARY_COLOR, RESET } from "./constants";
import { formatContextTokenUsage } from "./formatContextTokenUsage";
import { getCachedContextUsage } from "./getCachedContextUsage";
import { getContextColor } from "./getContextColor";
import { truncateFromStart } from "./truncateFromStart";

/**
 * Builds the promptline left and right display segments.
 *
 * @param ctx Extension context.
 * @param uiTheme UI theme.
 * @param getThinkingLevel Thinking-level getter.
 * @param width Available width.
 * @returns Promptline segments.
 */
export function buildPromptline(
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
	const displayCwd = ctx.cwd.startsWith(home)
		? `~${ctx.cwd.slice(home.length)}`
		: ctx.cwd;
	const folderIcon = uiTheme.fg(PRIMARY_COLOR as ThemeColor, "");
	const locationPath = truncateFromStart(
		displayCwd,
		Math.max(1, maxPathWidth - 2),
		"…",
	);
	const location = `${folderIcon} ${uiTheme.fg(PRIMARY_COLOR as ThemeColor, locationPath)}`;
	segments.push(location);

	const gitState = getGitState();
	if (branch) {
		let branchSegment = uiTheme.fg("syntaxFunction", branch);
		if (gitState.dirtyCount > 0)
			branchSegment += uiTheme.fg("warning", ` ✱${gitState.dirtyCount}`);
		if (gitState.ahead > 0 || gitState.behind > 0) {
			const arrows: string[] = [];
			if (gitState.ahead > 0) arrows.push(`↑${gitState.ahead}`);
			if (gitState.behind > 0) arrows.push(`↓${gitState.behind}`);
			branchSegment += uiTheme.fg("muted", ` ${arrows.join(" ")} `);
		}
		segments.push(branchSegment);
	}

	const contextWindow =
		usage?.contextWindow ?? currentModel?.contextWindow ?? 0;
	const rawTokens =
		typeof usage?.tokens === "number"
			? usage.tokens
			: typeof usage?.percent === "number" && contextWindow > 0
				? Math.round((usage.percent / 100) * contextWindow)
				: 0;
	// When pi reports 0 tokens (before it computes usage for a new message),
	// bridge the gap: startup usedTokens + delta from new user/assistant messages.
	const startupReport = getStartupContextReport();
	const displayTokens =
		rawTokens === 0 && startupReport?.usedTokens != null
			? computeBridgeTokens(ctx, startupReport.usedTokens)
			: rawTokens;
	const tokenUsage = formatContextTokenUsage(displayTokens, contextWindow);
	const contextBar = buildContextBar(usage?.percent);
	const contextColor = getContextColor(usage?.percent);
	return {
		left: segments
			.flatMap((segment, index) =>
				index === 0 ? [segment] : [separator, segment],
			)
			.join(""),
		right: ` ${contextColor} ${contextBar} ${tokenUsage}${RESET}`,
	};
}

/**
 * Bridges the gap when pi reports 0 tokens by adding new message tokens
 * to the startup baseline.
 *
 * @param ctx Extension context.
 * @param startupUsedTokens Token count at session start.
 * @returns Bridged token count.
 */
function computeBridgeTokens(
	ctx: ExtensionContext,
	startupUsedTokens: number,
): number {
	const branch = ctx.sessionManager.getBranch();
	let newMessageTokens = 0;
	for (const entry of branch) {
		if (entry.type !== "message") continue;
		const msg = entry.message as UserMessage | AssistantMessage;
		if (msg.role === "user") {
			// Estimate user message tokens from text content.
			const text =
				typeof msg.content === "string"
					? msg.content
					: (msg.content as { text?: string } | { text?: string[] }).text;
			const textStr =
				typeof text === "string"
					? text
					: Array.isArray(text)
						? text.join("\n")
						: "";
			newMessageTokens += estimateTokensFromText(textStr);
		} else if (msg.role === "assistant") {
			// Add assistant message usage from pi's internal tracking.
			const am = msg as AssistantMessage;
			newMessageTokens += (am.usage?.input ?? 0) + (am.usage?.output ?? 0);
		}
	}
	return startupUsedTokens + newMessageTokens;
}
