import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { USAGE_WIDGET_KEY } from "./usageWidgetKey.js";

/**
 * Clears the usage widget from the UI.
 *
 * @param ctx Pi extension context.
 */
export function clearUsageWidget(ctx: ExtensionContext): void {
	ctx.ui.setWidget(USAGE_WIDGET_KEY, undefined, { placement: "belowEditor" });
}
