import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { TOP_BAR_SPACER_KEY } from "./topBarSpacerKey.js";

/**
 * Reserves editor rows so the fixed top bar overlay does not cover the input.
 *
 * Pi adds one leading spacer before above-editor widgets, so five blank widget
 * lines yield six reserved rows total.
 *
 * @param ctx Extension runtime context.
 */
export function showTopBarSpacer(ctx: ExtensionContext): void {
	ctx.ui.setWidget(TOP_BAR_SPACER_KEY, ["", "", "", "", ""], { placement: "aboveEditor" });
}
