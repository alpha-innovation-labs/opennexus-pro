import { getWorkflowEngineerModePrompt } from "../../workflows/prompts/getWorkflowEngineerModePrompt.js";
import { getAgentConfig } from "../agent-types.js";

/**
 * Builds the per-agent instruction block embedded into the child prompt.
 *
 * @param subagentType Requested subagent type.
 * @param mode Optional subagent mode.
 * @returns Serialized instruction block.
 */
export function buildAgentInstructionBlock(subagentType: string, mode?: string): string {
  const config = getAgentConfig(subagentType);
  if (!config) return "";
  const lines = [
    `# Subagent Profile`,
    `Name: ${config.name}`,
    `Description: ${config.description}`,
  ];
  if (config.systemPrompt.trim()) {
    lines.push("", config.systemPrompt.trim());
  }
  const modePrompt = getModePrompt(config.name, mode);
  if (modePrompt) {
    lines.push("", "# Injected Subagent Mode", modePrompt.trim());
  }
  return lines.join("\n");
}

/**
 * Resolves a mode prompt only for agents that explicitly support mode injection.
 *
 * @param agentName Resolved subagent name.
 * @param mode Requested mode.
 * @returns Mode prompt text or undefined.
 */
function getModePrompt(agentName: string, mode: string | undefined): string | undefined {
  if (agentName.toLowerCase() !== "engineer") return undefined;
  return getWorkflowEngineerModePrompt(mode);
}
