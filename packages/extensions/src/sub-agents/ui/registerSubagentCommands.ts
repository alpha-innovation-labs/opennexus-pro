import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { withSlashMenuGroup } from "../../neo-editor/features/menu/withSlashMenuGroup.js";
import { showSubagentHistoryModal } from "./showSubagentHistoryModal.js";

/**
 * Registers subagent browsing commands.
 *
 * @param pi Pi extension API.
 */
export function registerSubagentCommands(pi: ExtensionAPI): void {
  pi.registerCommand("agents", withSlashMenuGroup({
    description: "Show subagent runs and transcript history",
    handler: async (_args, ctx) => {
      await showSubagentHistoryModal(ctx);
    },
  }, "Extensions"));
}
