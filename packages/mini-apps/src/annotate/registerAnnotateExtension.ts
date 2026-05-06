import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { withSlashMenuGroup } from "@nexus/extensions/neo-editor/features/menu/withSlashMenuGroup.js";
import { createAnnotateCommandHandler } from "./command/createAnnotateCommandHandler.js";
import { createAnnotateRuntimeState } from "./runtime/createAnnotateRuntimeState.js";
import { createAnnotateTool } from "./tool/createAnnotateTool.js";
import { createClaimAnnotationTool } from "./tool/createClaimAnnotationTool.js";
import { createReadPendingAnnotationsTool } from "./tool/createReadPendingAnnotationsTool.js";
import { createResolveAnnotationTool } from "./tool/createResolveAnnotationTool.js";

/**
 * Registers the Nexus Annotate command and tool.
 *
 * @param pi Pi extension API.
 */
export function registerAnnotateExtension(pi: ExtensionAPI): void {
  const state = createAnnotateRuntimeState(pi);

  pi.registerCommand("annotate", withSlashMenuGroup({
    description: "Start visual annotation mode in Chrome. Optionally provide a URL.",
    handler: createAnnotateCommandHandler(state),
  }, "Mini-Apps"));

  const registerTool = pi.registerTool as (definition: unknown) => void;
  registerTool(createAnnotateTool(state));
  registerTool(createReadPendingAnnotationsTool());
  registerTool(createClaimAnnotationTool());
  registerTool(createResolveAnnotationTool());
}
