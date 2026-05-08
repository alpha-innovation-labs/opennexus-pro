import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { createPanelOverlayOptions } from "../overlay/createPanelOverlayOptions.js";
import { ContextUsageModal } from "./ContextUsageModal.js";
import { createContextUsageReport } from "./createContextUsageReport.js";
import { createRuntimeSnapshot } from "./createRuntimeSnapshot.js";
import { formatContextUsage } from "./formatContextUsage.js";

/**
 * Handles /context by showing categorized live context usage.
 *
 * @param ctx Command context.
 */
export async function showContextUsageCommand(ctx: ExtensionCommandContext): Promise<void> {
  const report = await createContextUsageReport(createRuntimeSnapshot(ctx));
  if (!ctx.hasUI) {
    ctx.ui.notify(formatContextUsage(report), "info");
    return;
  }

  await ctx.ui.custom<void>(
    (_tui, theme, _keybindings, done) => new ContextUsageModal(theme, report, done),
    { overlay: true, overlayOptions: createPanelOverlayOptions(90, "100%") as never },
  );
}
