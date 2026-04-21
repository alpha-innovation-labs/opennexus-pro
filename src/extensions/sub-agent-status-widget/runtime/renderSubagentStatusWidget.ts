import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { createSubagentStatusWidget } from "../ui/createSubagentStatusWidget.js";
import { SUBAGENT_STATUS_WIDGET_KEY } from "./subagentStatusWidgetKey.js";

/**
 * Renders the subagent status widget below the editor.
 *
 * @param ctx Extension runtime context.
 */
export function renderSubagentStatusWidget(ctx: ExtensionContext): void {
  ctx.ui.setWidget(
    SUBAGENT_STATUS_WIDGET_KEY,
    () => createSubagentStatusWidget(ctx),
    { placement: "aboveEditor" },
  );
}
