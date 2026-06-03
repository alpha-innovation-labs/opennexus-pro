import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { visibleWidth } from "@earendil-works/pi-tui";
import { getPromptlineFrameWidth } from "@nexus/extensions/neo-editor/features/promptline/layout/getPromptlineFrameWidth.js";
import { hasConversationMessages } from "@nexus/extensions/neo-editor/features/promptline/layout/hasConversationMessages.js";
import { padPromptlineFrameToWidth } from "@nexus/extensions/neo-editor/features/promptline/layout/padPromptlineFrameToWidth.js";
import { getPromptlineModel } from "@nexus/extensions/neo-editor/features/promptline/getPromptlineModel.js";
import { isStartupProfileEnabled } from "@nexus/observability/startup-profile/isStartupProfileEnabled.js";
import { logExtensionEvent } from "@nexus/observability/startup-debug.js";
import { buildObservationsStatusLine } from "./buildObservationsStatusLine.js";
import { createBadge } from "./createBadge.js";
import { getSessionRunTimeLabel } from "./getSessionRunTimeLabel.js";
import { getVisibleSessionName } from "./getVisibleSessionName.js";

const MODEL_BADGE_BG = "\x1b[48;2;180;45;45m";
const THINKING_BADGE_BG = "\x1b[48;2;214;86;86m";

/**
 * Builds the below-editor observations status widget.
 *
 * @param ctx Pi extension context.
 * @param getThinkingLevel Pi thinking getter.
 * @param getSessionName Pi session name getter.
 * @returns Renderable widget component.
 */
export function createObservationsStatusWidget(
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
			const modelId = (getPromptlineModel(ctx)?.id ?? "no-model").replace(/^[^/]+\//, "");
			const thinking = getThinkingLevel();
			const hasMessages = hasConversationMessages(ctx);
			const frameWidth = getPromptlineFrameWidth(width, hasMessages);
			const sessionName = getVisibleSessionName(getSessionName);
			const runTime = hasMessages && sessionName ? ctx.ui.theme.fg("muted", getSessionRunTimeLabel()) : undefined;
			const key = [width, frameWidth, modelId, thinking, sessionName ?? "", runTime ?? ""].join("\u001f");
			if (cachedKey === key) return cachedLines;
			const badges = `${createBadge(modelId, MODEL_BADGE_BG)}${createBadge(thinking, THINKING_BADGE_BG)}`;
			const line = buildObservationsStatusLine(badges, runTime, sessionName, frameWidth, ctx.ui.theme);
			if (isStartupProfileEnabled()) {
				const renderedWidth = visibleWidth(line);
				if (renderedWidth > frameWidth) {
					logExtensionEvent("observations-status-widget", "overflow", {
						width: frameWidth,
						renderedWidth,
						sessionName: sessionName ?? null,
					});
				}
			}
			cachedKey = key;
			cachedLines = padPromptlineFrameToWidth([line], width, frameWidth);
			return cachedLines;
		},
	};
}
