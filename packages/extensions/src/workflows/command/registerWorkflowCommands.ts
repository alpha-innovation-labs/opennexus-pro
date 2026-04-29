import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { withSlashMenuGroup } from "../../neo-editor/features/menu/withSlashMenuGroup.js";
import { createWorkflowStartRequest } from "./createWorkflowStartRequest.js";
import { showWorkflowRunsModal } from "./showWorkflowRunsModal.js";
import { showWorkflowStartModal } from "./showWorkflowStartModal.js";
import { createWorkflowRun } from "../state/createWorkflowRun.js";
import { addWorkflowRun } from "../state/workflowRunStore.js";

/**
 * Registers workflow commands.
 *
 * @param pi Pi extension API.
 */
export function registerWorkflowCommands(pi: ExtensionAPI): void {
  pi.registerCommand("workflow-start", withSlashMenuGroup({
    description: "Pick and start a workflow.",
    handler: async (args, ctx) => {
      if (!ctx.hasUI) {
        ctx.ui.notify("/workflow-start requires interactive UI", "warning");
        return;
      }
      const definition = await showWorkflowStartModal(ctx);
      if (!definition) return;
      const run = createWorkflowRun(definition, args.trim() || undefined);
      addWorkflowRun(run);
      pi.sendUserMessage(createWorkflowStartRequest(definition, run, args));
    },
  }, "Extensions"));

  pi.registerCommand("workflows", withSlashMenuGroup({
    description: "Show workflow runs.",
    handler: async (_args, ctx) => {
      if (!ctx.hasUI) return;
      await showWorkflowRunsModal(ctx);
    },
  }, "Extensions"));
}
