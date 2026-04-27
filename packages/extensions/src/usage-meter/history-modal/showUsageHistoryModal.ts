import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { readUsageHistoryRecords } from "../history/readUsageHistoryRecords.js";
import { UsageHistoryModal } from "./UsageHistoryModal.js";

/**
 * Opens the usage history graph modal.
 *
 * @param ctx Extension context.
 */
export async function showUsageHistoryModal(ctx: ExtensionContext): Promise<void> {
  const records = await readUsageHistoryRecords();
  await ctx.ui.custom<void>((_tui, theme, _keybindings, done) => new UsageHistoryModal(theme, records, done), {
    overlay: true,
    overlayOptions: { anchor: "center", width: "85%", minWidth: 72, maxHeight: "75%" },
  });
}
