import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { TOP_BAR_SPACER_KEY } from "./topBarSpacerKey.js";

/**
 * Clears the reserved editor rows used by the top bar overlay.
 *
 * @param ctx Extension runtime context.
 */
export function hideTopBarSpacer(ctx: ExtensionContext): void {
	ctx.ui.setWidget(TOP_BAR_SPACER_KEY, undefined, { placement: "aboveEditor" });
}
