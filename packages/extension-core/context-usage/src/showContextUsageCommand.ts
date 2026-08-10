import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { createPanelOverlayOptions } from "@nexus/tui-kit/modal/createPanelOverlayOptions";
import { ContextUsageModal } from "./ContextUsageModal";
import { createContextUsageReport } from "./createContextUsageReport";
import { createRuntimeSnapshot } from "./createRuntimeSnapshot";
import { formatContextUsage } from "./formatContextUsage";

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
