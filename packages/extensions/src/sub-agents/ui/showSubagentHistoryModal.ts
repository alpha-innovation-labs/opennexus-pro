import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { createPanelOverlayOptions } from "../../overlay/createPanelOverlayOptions.js";
import { listAvailableSubagentRuns } from "../runtime/listAvailableSubagentRuns.js";
import { SubagentHistoryModal } from "./SubagentHistoryModal.js";

/**
 * Opens the shared two-pane subagent history modal.
 *
 * @param ctx Command context.
 * @param loadRuns Optional run loader for test injection.
 */
export async function showSubagentHistoryModal(
  ctx: ExtensionCommandContext,
  loadRuns: typeof listAvailableSubagentRuns = listAvailableSubagentRuns,
): Promise<void> {
  if (!ctx.hasUI) return;
  const parentSessionFile = ctx.sessionManager.getSessionFile();
  const runs = parentSessionFile
    ? await loadRuns({ cwd: ctx.cwd, parentSessionFile })
    : [];
  await ctx.ui.custom<void>(
    async (_tui, theme, _keybindings, done) => new SubagentHistoryModal(theme, runs, () => done()),
    {
      overlay: true,
      overlayOptions: createPanelOverlayOptions(80, "85%"),
    },
  );
}
