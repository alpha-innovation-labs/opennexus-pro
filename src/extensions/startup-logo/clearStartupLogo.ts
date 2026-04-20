import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { startupLogoWidgetKey } from "./startupLogoWidgetKey.js";

/**
 * Clears the startup logo widget.
 *
 * @param ctx Pi extension context.
 */
export function clearStartupLogo(ctx: ExtensionContext): void {
	ctx.ui.setWidget(startupLogoWidgetKey, undefined);
}
