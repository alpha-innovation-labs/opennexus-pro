import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { getUsageTextForModel } from "./model/getUsageTextForModel.js";
import { withSlashMenuGroup } from "../neo-editor/features/menu/withSlashMenuGroup.js";
import { appendUsageHistoryRecords } from "./history/appendUsageHistoryRecords.js";
import { createUsageHistoryRecords } from "./history/createUsageHistoryRecord.js";
import { showUsageHistoryModal } from "./history-modal/showUsageHistoryModal.js";
import { refreshUsageForContext } from "./runtime/refreshUsageForContext.js";

/**
 * Registers the historical usage graph command.
 *
 * @param pi Pi extension API.
 */
export function registerUsageCommand(pi: ExtensionAPI): void {
  pi.registerCommand("usage", withSlashMenuGroup({
    description: "Show historical usage graphs",
    handler: async (_args, ctx) => {
      const snapshot = await refreshUsageForContext(ctx, true);
      if (snapshot) await appendUsageHistoryRecords(createUsageHistoryRecords(snapshot, ctx.model));
      if (!ctx.hasUI) return;
      try {
        await showUsageHistoryModal(ctx);
      } catch {
        ctx.ui.notify(getUsageTextForModel(ctx.model), "info");
      }
    },
  }, "Configuration"));
}
