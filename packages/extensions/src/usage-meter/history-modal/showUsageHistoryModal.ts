import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { createPanelOverlayOptions } from "../../overlay/createPanelOverlayOptions.js";
import { clearStartupLogo } from "../../startup-logo/clearStartupLogo.js";
import { readUsageHistoryRecords } from "../history/readUsageHistoryRecords.js";
import { UsageHistoryModal } from "./UsageHistoryModal.js";

/**
 * Opens the usage history graph modal.
 *
 * @param ctx Extension context.
 */
export async function showUsageHistoryModal(ctx: ExtensionContext): Promise<void> {
  const records = await readUsageHistoryRecords();
  clearStartupLogo(ctx);
  await ctx.ui.custom<void>((tui, theme, _keybindings, done) => new UsageHistoryModal(theme, records, done, () => tui.requestRender()), {
    overlay: true,
    overlayOptions: createPanelOverlayOptions(72, "85%"),
  });
}
