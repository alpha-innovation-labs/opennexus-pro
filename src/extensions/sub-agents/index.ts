import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { loadCustomAgents } from "./custom-agents.js";
import { registerAgents } from "./agent-types.js";
import { createAgentTool } from "./tooling/createAgentTool.js";
import { createGetSubagentResultTool } from "./tooling/createGetSubagentResultTool.js";
import { createSteerSubagentTool } from "./tooling/createSteerSubagentTool.js";
import { registerSubagentCommands } from "./ui/registerSubagentCommands.js";

/**
 * Registers the RPC-based subagents execution extension.
 *
 * @param pi Pi extension API.
 */
export default function registerSubAgentsExtension(pi: ExtensionAPI): void {
  registerAgents(loadCustomAgents(process.cwd()));
  pi.registerTool(createAgentTool());
  pi.registerTool(createGetSubagentResultTool());
  pi.registerTool(createSteerSubagentTool());
  registerSubagentCommands(pi);
}
