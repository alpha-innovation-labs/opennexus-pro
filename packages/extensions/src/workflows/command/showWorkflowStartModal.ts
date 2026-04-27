import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { createPanelOverlayOptions } from "../../overlay/createPanelOverlayOptions.js";
import { getWorkflowDefinitions } from "../state/getWorkflowDefinitions.js";
import type { WorkflowDefinition } from "../state/types.js";
import { WorkflowStartModal } from "../modal/WorkflowStartModal.js";

/**
 * Opens the workflow picker modal.
 *
 * @param ctx Extension command context.
 * @returns Selected workflow definition or null.
 */
export async function showWorkflowStartModal(ctx: ExtensionCommandContext): Promise<WorkflowDefinition | null> {
  const definitions = getWorkflowDefinitions();
  return ctx.ui.custom<WorkflowDefinition | null>(
    (_tui, theme, _keybindings, done) => new WorkflowStartModal(theme, definitions, done),
    {
      overlay: true,
      overlayOptions: createPanelOverlayOptions(80, "85%"),
    },
  );
}
