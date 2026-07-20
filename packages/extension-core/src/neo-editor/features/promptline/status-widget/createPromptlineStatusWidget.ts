import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { visibleWidth } from "@earendil-works/pi-tui";
import { isStartupProfileEnabled } from "@nexus/observability/startup-profile/isStartupProfileEnabled.js";
import { logExtensionEvent } from "@nexus/observability/startup-debug.js";
import { getPromptlineModel } from "../getPromptlineModel.js";
import { getPromptlineFrameWidth } from "../layout/getPromptlineFrameWidth.js";
import { hasConversationMessages } from "../layout/hasConversationMessages.js";
import { padPromptlineFrameToWidth } from "../layout/padPromptlineFrameToWidth.js";
import { buildPromptlineStatusLine } from "./buildPromptlineStatusLine.js";
import { createPromptlineBadge } from "./createPromptlineBadge.js";
import { getPromptlineSessionRunTimeLabel } from "./getPromptlineSessionRunTimeLabel.js";
import { getPromptlineStatusTitle } from "./getPromptlineStatusTitle.js";

const PROVIDER_BADGE_BG = "\x1b[48;2;120;30;30m";
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
	let cachedKey: string | undefined;
	let cachedLines: string[] = [];
	return {
		invalidate(): void {
			cachedKey = undefined;
			cachedLines = [];
		},
		render(width: number): string[] {
			const modelInfo = getPromptlineModel(ctx);
			const modelId = (modelInfo?.id ?? "no-model").replace(/^[^/]+\//, "");
			const provider = modelInfo?.provider ?? "unknown";
			const thinking = getThinkingLevel();
			const hasMessages = hasConversationMessages(ctx);
			const frameWidth = getPromptlineFrameWidth(width, hasMessages);
			const title = getPromptlineStatusTitle(getSessionName, ctx);
			const runTime = hasMessages && title ? ctx.ui.theme.fg("muted", getPromptlineSessionRunTimeLabel()) : undefined;
			const key = [width, frameWidth, modelId, thinking, title ?? "", runTime ?? ""].join("\u001f");
			if (cachedKey === key) return cachedLines;
			const badges = `${createPromptlineBadge(provider, PROVIDER_BADGE_BG)}${createPromptlineBadge(modelId, MODEL_BADGE_BG)}${createPromptlineBadge(thinking, THINKING_BADGE_BG)}`;
			const line = buildPromptlineStatusLine(badges, runTime, title, frameWidth, ctx.ui.theme);
			if (isStartupProfileEnabled()) {
				const renderedWidth = visibleWidth(line);
				if (renderedWidth > frameWidth) {
					logExtensionEvent("promptline-status-widget", "overflow", {
						width: frameWidth,
						renderedWidth,
						sessionName: title ?? null,
					});
				}
			}
			cachedKey = key;
			cachedLines = padPromptlineFrameToWidth([line], width, frameWidth);
			return cachedLines;
		},
	};
}
