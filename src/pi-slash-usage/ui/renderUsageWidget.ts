import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { createUsageWidget } from "./createUsageWidget.js";
import { USAGE_WIDGET_KEY } from "./usageWidgetKey.js";

/**
 * Renders the below-editor usage widget.
 *
 * @param ctx Pi extension context.
 */
export function renderUsageWidget(ctx: ExtensionContext): void {
	ctx.ui.setWidget(USAGE_WIDGET_KEY, () => createUsageWidget(ctx), { placement: "belowEditor" });
}
