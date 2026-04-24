import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
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
      overlayOptions: {
        anchor: "center",
        width: "80%",
        minWidth: 80,
        maxHeight: "85%",
      },
    },
  );
}
