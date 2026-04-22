import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { buildStartupLogoLines } from "./buildStartupLogoLines.js";
import { startupLogoWidgetKey } from "./startupLogoWidgetKey.js";

/**
 * Renders the startup logo above the editor.
 *
 * @param ctx Pi extension context.
 */
export function showStartupLogo(ctx: ExtensionContext): void {
	ctx.ui.setWidget(startupLogoWidgetKey, buildStartupLogoLines(ctx.ui.theme), { placement: "aboveEditor" });
}
