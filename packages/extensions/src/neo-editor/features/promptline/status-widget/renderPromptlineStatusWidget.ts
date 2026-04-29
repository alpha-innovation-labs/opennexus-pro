import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { createPromptlineStatusWidget } from "./createPromptlineStatusWidget.js";
import { PROMPTLINE_STATUS_WIDGET_KEY } from "./promptlineStatusWidgetKey.js";

/**
 * Renders the promptline metadata widget below the editor.
 *
 * @param ctx Pi extension context.
 * @param getThinkingLevel Pi thinking getter.
 * @param getSessionName Pi session name getter.
 */
export function renderPromptlineStatusWidget(
	ctx: ExtensionContext,
	getThinkingLevel: ExtensionAPI["getThinkingLevel"],
	getSessionName: ExtensionAPI["getSessionName"],
): void {
	ctx.ui.setWidget(
		PROMPTLINE_STATUS_WIDGET_KEY,
		() => createPromptlineStatusWidget(ctx, getThinkingLevel, getSessionName),
		{ placement: "belowEditor" },
	);
}
