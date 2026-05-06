import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { createPanelOverlayOptions } from "@nexus/extensions/overlay/createPanelOverlayOptions.js";
import { WorkflowRunsModal } from "../modal/WorkflowRunsModal.js";
import { getWorkflowRuns } from "../state/workflowRunStore.js";

/**
 * Opens the workflow runs modal.
 *
 * @param ctx Extension command context.
 */
export async function showWorkflowRunsModal(ctx: ExtensionCommandContext): Promise<void> {
  const runs = getWorkflowRuns();
  if (runs.length === 0) {
    ctx.ui.notify("No workflow runs yet", "info");
    return;
  }
  await ctx.ui.custom<undefined>(
    (_tui, theme, _keybindings, done) => new WorkflowRunsModal(theme, runs, done),
    {
      overlay: true,
      overlayOptions: createPanelOverlayOptions(80, "85%"),
    },
  );
}
