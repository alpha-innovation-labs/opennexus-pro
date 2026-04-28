import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";
import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { getPromptlineFrameWidth } from "../layout/getPromptlineFrameWidth.js";
import { hasConversationMessages } from "../layout/hasConversationMessages.js";
import { padPromptlineFrameToWidth } from "../layout/padPromptlineFrameToWidth.js";
import { getPromptlineModel } from "../getPromptlineModel.js";

/**
 * Renders the below-editor model/thinking footer for the Neo promptline.
 *
 * @param width Available terminal width.
 * @param _theme Active UI theme.
 * @param ctx Active extension context.
 * @param getThinkingLevel Current thinking-level getter.
 * @param modelOverride Optional model to render immediately.
 * @returns Footer lines aligned with the promptline frame.
 */
export function renderPromptlineFooter(
	width: number,
	_theme: { fg(color: string, value: string): string },
	ctx: ExtensionContext,
	getThinkingLevel: ExtensionAPI["getThinkingLevel"],
	modelOverride?: ExtensionContext["model"],
): string[] {
	const frameWidth = getPromptlineFrameWidth(width, hasConversationMessages(ctx));
	const model = modelOverride ?? getPromptlineModel(ctx);
	const modelName = model?.id ?? "no-model";
	const thinking = model?.reasoning ? getThinkingLevel() : "off";
	const label = truncateToWidth(`${modelName}  ${thinking}`, Math.max(1, frameWidth), "…");
	const line = `${" ".repeat(Math.max(0, frameWidth - visibleWidth(label)))}${label}`;
	return [...padPromptlineFrameToWidth([line], width, frameWidth), " ".repeat(width)];
}
