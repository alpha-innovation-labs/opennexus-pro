import type { BuildSystemPromptOptions } from "@earendil-works/pi-coding-agent";
import type { ContextUsageDetailItem } from "./types";
import { estimateTokensFromText } from "./estimateTokensFromText";


/**
 * Creates tokenized skill items exactly as Pi lists them in the system prompt.
 *
 * @param options Latest system prompt options.
 * @returns Skill detail items.
 */
export async function createSkillItems(options: BuildSystemPromptOptions | undefined): Promise<ContextUsageDetailItem[]> {
  return (options?.skills ?? [])
    .filter((skill) => !skill.disableModelInvocation)
    .map((skill) => ({
      label: skill.name,
      tokens: estimateTokensFromText(formatPromptSkillEntry(skill.name, skill.description, skill.filePath)),
    }));
}

/**
 * Formats a skill entry in the same XML shape Pi injects into the system prompt.
 *
 * @param name Skill name.
 * @param description Skill description.
 * @param filePath Skill file path.
 * @returns Prompt skill entry text.
 */
function formatPromptSkillEntry(name: string, description: string, filePath: string): string {
  return [`  <skill>`, `    <name>${escapeXml(name)}</name>`, `    <description>${escapeXml(description)}</description>`, `    <location>${escapeXml(filePath)}</location>`, `  </skill>`].join("\n");
}

/**
 * Escapes XML entities like Pi skill formatting.
 *
 * @param value Plain value.
 * @returns XML-safe value.
 */
function escapeXml(value: string): string {
  return value.replace(/&/gu, "&amp;").replace(/</gu, "&lt;").replace(/>/gu, "&gt;").replace(/"/gu, "&quot;").replace(/'/gu, "&apos;");
}
