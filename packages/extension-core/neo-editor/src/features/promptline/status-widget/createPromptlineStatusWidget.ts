import type {
	ExtensionAPI,
	ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import { visibleWidth, type Component } from "@earendil-works/pi-tui";
import { logExtensionEvent } from "@nexus/observability/startup-debug";
import { isStartupProfileEnabled } from "@nexus/observability/startup-profile/isStartupProfileEnabled";
import { getPromptlineModel } from "../getPromptlineModel";
import { getPromptlineFrameWidth } from "../layout/getPromptlineFrameWidth";
import { getPromptlineFrameLeftPadding } from "../layout/getPromptlineFrameLeftPadding";
import { hasConversationMessages } from "../layout/hasConversationMessages";
import { padPromptlineFrameToWidth } from "../layout/padPromptlineFrameToWidth";
import { layoutPromptlineStatusLine } from "./buildPromptlineStatusLine";
import { createPromptlineBadge } from "./createPromptlineBadge";
import { getPromptlineSessionRunTimeLabel } from "./getPromptlineSessionRunTimeLabel";
import { getPromptlineStatusTitle } from "./getPromptlineStatusTitle";
import { getPromptlineTpsLabel } from "./promptlineTpsTracker";

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
	getAgentCountsLabel: () => string = () => "",
	onProviderClick?: () => void,
): Component {
	let cachedKey: string | undefined;
	let cachedLines: string[] = [];
	let providerHit: { start: number; end: number; width: number } | undefined;
	return {
		handleMouse(event) {
			if (!onProviderClick || !providerHit || event.type !== "click" || event.button !== "left"
				|| event.y !== 0 || event.width !== providerHit.width
				|| event.x < providerHit.start || event.x >= providerHit.end) return undefined;
			onProviderClick();
			// Do not focus the metadata row: the opened picker owns keyboard focus.
			return { handled: true };
		},
		invalidate(): void {
			cachedKey = undefined;
			cachedLines = [];
			providerHit = undefined;
		},
		render(width: number): string[] {
			const modelInfo = getPromptlineModel(ctx);
			const modelId = (modelInfo?.id ?? "no-model").replace(/^[^/]+\//, "");
			const provider = modelInfo?.provider ?? "unknown";
			const thinking = getThinkingLevel();
			const hasMessages = hasConversationMessages(ctx);
			const frameWidth = getPromptlineFrameWidth(width, hasMessages);
			const title = getPromptlineStatusTitle(getSessionName, ctx);
			const tps = getPromptlineTpsLabel();
			const agentCounts = getAgentCountsLabel();
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
				provider,
				tps,
				agentCounts,
				thinking,
				title ?? "",
				runTime ?? "",
			].join("\u001f");
			if (cachedKey === key) return cachedLines;
			const providerBadge = createPromptlineBadge(provider, PROVIDER_BADGE_BG);
			const badges = `${providerBadge}${createPromptlineBadge(modelId, MODEL_BADGE_BG)}${createPromptlineBadge(thinking, THINKING_BADGE_BG)}`;
			const { line, badgesWidth } = layoutPromptlineStatusLine(
				badges,
				[agentCounts, tps, runTime].filter(Boolean).join(" "),
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
			const start = getPromptlineFrameLeftPadding(width, frameWidth);
			providerHit = {
				start,
				end: start + Math.min(visibleWidth(providerBadge), badgesWidth),
				width,
			};
			cachedKey = key;
			cachedLines = padPromptlineFrameToWidth([line], width, frameWidth);
			return cachedLines;
		},
	};
}
