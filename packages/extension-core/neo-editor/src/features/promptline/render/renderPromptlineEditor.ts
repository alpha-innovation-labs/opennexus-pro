import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { getPromptlineFrameWidth } from "../layout/getPromptlineFrameWidth";
import { hasConversationMessages } from "../layout/hasConversationMessages";
import { padPromptlineFrameToWidth } from "../layout/padPromptlineFrameToWidth";
import { renderPromptlineFrame } from "./renderPromptlineFrame";

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
