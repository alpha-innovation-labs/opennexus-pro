import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { createPanelOverlayOptions } from "@nexus/tui-kit/modal/createPanelOverlayOptions.js";
import { clearStartupHero } from "../../startup-hero/clearStartupHero.js";
import { readUsageHistoryRecords } from "../history/readUsageHistoryRecords.js";
import { UsageHistoryModal } from "./UsageHistoryModal.js";

/**
 * Opens the usage history graph modal.
 *
 * @param ctx Extension context.
 */
export async function showUsageHistoryModal(ctx: ExtensionContext): Promise<void> {
  const records = await readUsageHistoryRecords();
  clearStartupHero(ctx);
  await ctx.ui.custom<void>((tui, theme, _keybindings, done) => new UsageHistoryModal(theme, records, done, () => tui.requestRender(), () => tui.terminal.rows ?? 40), {
    overlay: true,
    overlayOptions: createPanelOverlayOptions(72, "85%"),
  });
}
