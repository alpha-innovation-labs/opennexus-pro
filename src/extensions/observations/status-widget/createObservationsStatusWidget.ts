import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { visibleWidth } from "@mariozechner/pi-tui";
import { getPromptlineFrameWidth } from "../../neo-editor/features/promptline/layout/getPromptlineFrameWidth.js";
import { hasConversationMessages } from "../../neo-editor/features/promptline/layout/hasConversationMessages.js";
import { padPromptlineFrameToWidth } from "../../neo-editor/features/promptline/layout/padPromptlineFrameToWidth.js";
import { logExtensionEvent } from "../../shared/observability/startup-debug.ts";
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
	const modelId = (ctx.model?.id ?? "no-model").replace(/^[^/]+\//, "");
	const thinking = getThinkingLevel();
	const badges = `${createBadge(modelId, MODEL_BADGE_BG)}${createBadge(thinking, THINKING_BADGE_BG)}`;
	return {
		invalidate(): void {},
		render(width: number): string[] {
			const hasMessages = hasConversationMessages(ctx);
			const frameWidth = getPromptlineFrameWidth(width, hasMessages);
			const sessionName = getVisibleSessionName(getSessionName);
			const runTime = hasMessages && sessionName ? ctx.ui.theme.fg("muted", getSessionRunTimeLabel()) : undefined;
			const line = buildObservationsStatusLine(badges, runTime, sessionName, frameWidth, ctx.ui.theme);
			const renderedWidth = visibleWidth(line);
			if (renderedWidth > frameWidth) {
				logExtensionEvent("observations-status-widget", "overflow", {
					width: frameWidth,
					renderedWidth,
					sessionName: sessionName ?? null,
				});
			}
			return padPromptlineFrameToWidth([line], width, frameWidth);
		},
	};
}
