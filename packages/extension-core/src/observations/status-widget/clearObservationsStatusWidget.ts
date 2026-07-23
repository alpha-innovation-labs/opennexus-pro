import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { OBSERVATIONS_STATUS_WIDGET_KEY } from "./observationsStatusWidgetKey.js";

/**
 * Removes the observations status widget from the UI.
 *
 * @param ctx Pi extension context.
 */
export function clearObservationsStatusWidget(ctx: ExtensionContext): void {
	ctx.ui.setWidget(OBSERVATIONS_STATUS_WIDGET_KEY, undefined, { placement: "belowEditor" });
}
