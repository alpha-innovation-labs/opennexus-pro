import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { visibleWidth } from "@mariozechner/pi-tui";
import { logExtensionEvent } from "@nexus/observability/startup-debug.js";
import { getPromptlineModel } from "../getPromptlineModel.js";
import { getPromptlineFrameWidth } from "../layout/getPromptlineFrameWidth.js";
import { hasConversationMessages } from "../layout/hasConversationMessages.js";
import { padPromptlineFrameToWidth } from "../layout/padPromptlineFrameToWidth.js";
import { buildPromptlineStatusLine } from "./buildPromptlineStatusLine.js";
import { createPromptlineBadge } from "./createPromptlineBadge.js";
import { getPromptlineSessionRunTimeLabel } from "./getPromptlineSessionRunTimeLabel.js";
import { getVisiblePromptlineSessionName } from "./getVisiblePromptlineSessionName.js";

const MODEL_BADGE_BG = "\x1b[48;2;180;45;45m";
const THINKING_BADGE_BG = "\x1b[48;2;214;86;86m";

/**
 * Builds the below-editor promptline status widget shown in all runtimes.
 *
 * @param ctx Pi extension context.
 * @param getThinkingLevel Pi thinking getter.
 * @param getSessionName Pi session name getter.
 * @returns Renderable widget component.
 */
export function createPromptlineStatusWidget(
	ctx: ExtensionContext,
	getThinkingLevel: ExtensionAPI["getThinkingLevel"],
	getSessionName: ExtensionAPI["getSessionName"],
): { invalidate(): void; render(width: number): string[] } {
	return {
		invalidate(): void {},
		render(width: number): string[] {
			const modelId = (getPromptlineModel(ctx)?.id ?? "no-model").replace(/^[^/]+\//, "");
			const thinking = getThinkingLevel();
			const badges = `${createPromptlineBadge(modelId, MODEL_BADGE_BG)}${createPromptlineBadge(thinking, THINKING_BADGE_BG)}`;
			const hasMessages = hasConversationMessages(ctx);
			const frameWidth = getPromptlineFrameWidth(width, hasMessages);
			const sessionName = getVisiblePromptlineSessionName(getSessionName);
			const runTime = hasMessages && sessionName ? ctx.ui.theme.fg("muted", getPromptlineSessionRunTimeLabel()) : undefined;
			const line = buildPromptlineStatusLine(badges, runTime, sessionName, frameWidth, ctx.ui.theme);
			const renderedWidth = visibleWidth(line);
			if (renderedWidth > frameWidth) {
				logExtensionEvent("promptline-status-widget", "overflow", {
					width: frameWidth,
					renderedWidth,
					sessionName: sessionName ?? null,
				});
			}
			return padPromptlineFrameToWidth([line], width, frameWidth);
		},
	};
}
