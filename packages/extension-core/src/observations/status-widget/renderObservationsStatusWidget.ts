import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { createObservationsStatusWidget } from "./createObservationsStatusWidget.js";
import { OBSERVATIONS_STATUS_WIDGET_KEY } from "./observationsStatusWidgetKey.js";

/**
 * Renders the observations status widget below the editor.
 *
 * @param ctx Pi extension context.
 * @param getThinkingLevel Pi thinking getter.
 * @param getSessionName Pi session name getter.
 */
export function renderObservationsStatusWidget(
	ctx: ExtensionContext,
	getThinkingLevel: ExtensionAPI["getThinkingLevel"],
	getSessionName: ExtensionAPI["getSessionName"],
): void {
	ctx.ui.setWidget(
		OBSERVATIONS_STATUS_WIDGET_KEY,
		() => createObservationsStatusWidget(ctx, getThinkingLevel, getSessionName),
		{ placement: "belowEditor" },
	);
}
