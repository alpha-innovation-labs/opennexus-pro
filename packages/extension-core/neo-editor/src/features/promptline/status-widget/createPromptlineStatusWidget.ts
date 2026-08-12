import type {
	ExtensionAPI,
	ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import { visibleWidth } from "@earendil-works/pi-tui";
import { logExtensionEvent } from "@nexus/observability";
import { isStartupProfileEnabled } from "@nexus/observability";
import { getPromptlineModel } from "../getPromptlineModel";
import { getPromptlineFrameWidth } from "../layout/getPromptlineFrameWidth";
import { hasConversationMessages } from "../layout/hasConversationMessages";
import { padPromptlineFrameToWidth } from "../layout/padPromptlineFrameToWidth";
import { buildPromptlineStatusLine } from "./buildPromptlineStatusLine";
import { createPromptlineBadge } from "./createPromptlineBadge";
import { getPromptlineSessionRunTimeLabel } from "./getPromptlineSessionRunTimeLabel";
import { getPromptlineStatusTitle } from "./getPromptlineStatusTitle";

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
			const runTime =
				hasMessages && title
					? ctx.ui.theme.fg(
							"muted" as never,
							getPromptlineSessionRunTimeLabel(),
						)
					: undefined;

			const key = [
				width,
				frameWidth,
				modelId,
				thinking,
				title ?? "",
				runTime ?? "",
			].join("\u001f");
			if (cachedKey === key) return cachedLines;
			const badges = `${createPromptlineBadge(provider, PROVIDER_BADGE_BG)}${createPromptlineBadge(modelId, MODEL_BADGE_BG)}${createPromptlineBadge(thinking, THINKING_BADGE_BG)}`;
			const line = buildPromptlineStatusLine(
				badges,
				runTime,
				title,
				frameWidth,
				ctx.ui.theme,
			);
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
