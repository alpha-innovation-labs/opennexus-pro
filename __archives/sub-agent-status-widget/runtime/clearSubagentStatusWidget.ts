import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { SUBAGENT_STATUS_WIDGET_KEY } from "./subagentStatusWidgetKey.js";

/**
 * Clears the subagent status widget.
 *
 * @param ctx Extension runtime context.
 */
export function clearSubagentStatusWidget(ctx: ExtensionContext): void {
  ctx.ui.setWidget(SUBAGENT_STATUS_WIDGET_KEY, undefined, { placement: "aboveEditor" });
}
