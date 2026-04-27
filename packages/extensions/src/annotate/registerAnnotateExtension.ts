import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { withSlashMenuGroup } from "../neo-editor/features/menu/withSlashMenuGroup.js";
import { createAnnotateCommandHandler } from "./command/createAnnotateCommandHandler.js";
import { createAnnotateRuntimeState } from "./runtime/createAnnotateRuntimeState.js";
import { createAnnotateTool } from "./tool/createAnnotateTool.js";

/**
 * Registers the Pi Annotate command and tool.
 *
 * @param pi Pi extension API.
 */
export function registerAnnotateExtension(pi: ExtensionAPI): void {
  const state = createAnnotateRuntimeState(pi);

  pi.registerCommand("annotate", withSlashMenuGroup({
    description: "Start visual annotation mode in Chrome. Optionally provide a URL.",
    handler: createAnnotateCommandHandler(state),
  }, "Workspace"));

  (pi.registerTool as (definition: unknown) => void)(createAnnotateTool(state));
}
