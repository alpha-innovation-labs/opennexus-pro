import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { getPromptlineFrameWidth } from "../layout/getPromptlineFrameWidth.js";
import { hasConversationMessages } from "../layout/hasConversationMessages.js";
import { padPromptlineFrameToWidth } from "../layout/padPromptlineFrameToWidth.js";
import { renderPromptlineFrame } from "./renderPromptlineFrame.js";

/**
 * Renders the responsive Neo promptline editor frame.
 *
 * @param width Current terminal render width.
 * @param renderBaseLines Renders the wrapped base editor for a frame width.
 * @param borderColor Border color callback.
 * @param uiTheme Nexus UI theme.
 * @param ctx Extension context.
 * @param getThinkingLevel Thinking-level getter.
 * @returns Rendered promptline lines.
 */
export function renderPromptlineEditor(
	width: number,
	renderBaseLines: (frameWidth: number) => string[],
	borderColor: (text: string) => string,
	uiTheme: ExtensionContext["ui"]["theme"],
	ctx: ExtensionContext,
	getThinkingLevel: ExtensionAPI["getThinkingLevel"],
): string[] {
	const frameWidth = getPromptlineFrameWidth(width, hasConversationMessages(ctx));
	const frameLines = renderPromptlineFrame(renderBaseLines(frameWidth), frameWidth, borderColor, uiTheme, ctx, getThinkingLevel);
	return padPromptlineFrameToWidth(frameLines, width, frameWidth);
}
