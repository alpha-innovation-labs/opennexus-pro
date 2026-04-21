import { getAgentConfig } from "../agent-types.js";

/**
 * Builds the per-agent instruction block embedded into the child prompt.
 *
 * @param subagentType Requested subagent type.
 * @returns Serialized instruction block.
 */
export function buildAgentInstructionBlock(subagentType: string): string {
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
  return lines.join("\n");
}
