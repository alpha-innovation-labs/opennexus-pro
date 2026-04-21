import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";
import { logExtensionEvent } from "../../shared/observability/startup-debug.ts";
import { createBadge } from "./createBadge.js";
import { getSessionRunTimeLabel } from "./getSessionRunTimeLabel.js";

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
			const sessionName = getSessionName()?.trim() || "Untitled session";
			const gap = " ";
			const runTime = ctx.ui.theme.fg("muted", getSessionRunTimeLabel());
			const titleRaw = ctx.ui.theme.fg("muted", sessionName);
			const reservedWidth = visibleWidth(badges) + visibleWidth(gap) + visibleWidth(runTime) + visibleWidth(gap);
			const maxTitle = Math.max(1, width - reservedWidth);
			const title = truncateToWidth(titleRaw, maxTitle, ctx.ui.theme.fg("dim", "…"));
			const line = `${badges}${gap}${runTime}${gap}${title}`;
			const renderedWidth = visibleWidth(line);
			if (renderedWidth > width) {
				logExtensionEvent("observations-status-widget", "overflow", {
					width,
					renderedWidth,
					sessionName,
				});
			}
			return [line];
		},
	};
}
