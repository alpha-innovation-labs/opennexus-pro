import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { listAvailableSubagentRuns } from "../runtime/listAvailableSubagentRuns.js";
import { SubagentHistoryModal } from "./SubagentHistoryModal.js";

/**
 * Opens the shared two-pane subagent history modal.
 *
 * @param ctx Command context.
 */
export async function showSubagentHistoryModal(ctx: ExtensionCommandContext): Promise<void> {
  if (!ctx.hasUI) return;
  const runs = await listAvailableSubagentRuns();
  await ctx.ui.custom<void>(
    async (_tui, theme, _keybindings, done) => new SubagentHistoryModal(theme, runs, () => done()),
    {
      overlay: true,
      overlayOptions: {
        anchor: "center",
        width: "80%",
        minWidth: 80,
        maxHeight: "85%",
      },
    },
  );
}
