import type {
	ExtensionAPI,
	ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import { getGitState } from "../../../shared/git/state";
import { renderBottomBorderLabel } from "../../../shared/ui/renderBottomBorderLabel";
import { extractEditorContentLines } from "../extractEditorContentLines";
import { getPromptlineModel } from "../getPromptlineModel";
import { padToWidth } from "../padToWidth";
import { prefixEditorLine } from "../prefixEditorLine";
import { buildPromptline } from "./buildPromptline";
import { getCachedContextUsage } from "./getCachedContextUsage";
import { renderPromptlineBorder } from "./renderPromptlineBorder";

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
	const usageText = "";
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
	const promptline = buildPromptline(ctx, uiTheme, () => thinking, innerWidth);
	let chrome = promptlineFrameChromeCache;
	if (chrome?.key !== chromeKey) {
		chrome = {
			key: chromeKey,
			top:
				borderColor("╭") +
				renderPromptlineBorder(borderColor, uiTheme, innerWidth, promptline) +
				borderColor("╮"),
			bottom:
				borderColor("╰") +
				renderBottomBorderLabel(borderColor, uiTheme, innerWidth, usageText) +
				borderColor("╯"),
		};
		promptlineFrameChromeCache = chrome;
	}
	const contentLines = editorContent.map((entry) =>
		padToWidth(entry, innerWidth),
	);

	if (contentLines.length > 0) {
		const firstLine = contentLines[0];
		if (firstLine) {
			contentLines[0] = prefixEditorLine(
				firstLine.replace(/^\s+/, ""),
				innerWidth,
				"» ",
				(text) => uiTheme.fg("error", text),
			);
		}
	}

	return [
		chrome.top,
		...contentLines.map(
			(entry) =>
				borderColor("│") + padToWidth(entry, innerWidth) + borderColor("│"),
		),
		chrome.bottom,
	];
}
