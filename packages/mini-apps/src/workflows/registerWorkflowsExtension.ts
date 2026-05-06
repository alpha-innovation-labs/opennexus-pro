import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { registerWorkflowCommands } from "./command/registerWorkflowCommands.js";
import { registerWorkflowAgentEvents } from "./events/registerWorkflowAgentEvents.js";

/**
 * Registers workflow orchestration commands, prompts, and progress tracking.
 *
 * @param pi Pi extension API.
 */
export function registerWorkflowsExtension(pi: ExtensionAPI): void {
  registerWorkflowCommands(pi);
  registerWorkflowAgentEvents(pi);
}
