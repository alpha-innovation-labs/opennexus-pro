import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { sharedSubagentRuntime } from "../sub-agents/runtime/sharedSubagentRuntime.js";
import { clearSubagentStatusWidget } from "./runtime/clearSubagentStatusWidget.js";
import { renderSubagentStatusWidget } from "./runtime/renderSubagentStatusWidget.js";
import { subagentStatusWidgetIndicator } from "./runtime/subagentStatusWidgetIndicator.js";

/**
 * Registers the subagent status widget extension.
 *
 * @param pi Pi extension API.
 */
export function registerSubagentStatusWidgetExtension(pi: ExtensionAPI): void {
  let activeContext: ExtensionContext | null = null;
  const renderActive = (): void => {
    if (!activeContext?.hasUI) return;
    renderSubagentStatusWidget(activeContext);
  };

  sharedSubagentRuntime.subscribe(() => {
    renderActive();
  });

  pi.on("session_start", async (_event, ctx) => {
    activeContext = ctx;
    if (!ctx.hasUI) return;
    ctx.ui.setWorkingIndicator(subagentStatusWidgetIndicator);
    renderSubagentStatusWidget(ctx);
  });

  pi.on("session_shutdown", async (_event, ctx) => {
    if (ctx.hasUI) {
      ctx.ui.setWorkingIndicator();
      clearSubagentStatusWidget(ctx);
    }
    activeContext = null;
  });
}

export default registerSubagentStatusWidgetExtension;
