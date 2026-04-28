import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { startupHeroWidgetKey } from "./startupHeroWidgetKey.js";

/**
 * Clears the startup hero widget.
 *
 * @param ctx Pi extension context.
 */
export function clearStartupHero(ctx: ExtensionContext): void {
	ctx.ui.setWidget(startupHeroWidgetKey, undefined, { placement: "aboveEditor" });
}
