import type { ContextUsageDetailItem } from "./types";
import { estimateTokensFromText } from "./estimateTokensFromText";

/**
 * Parses loaded skills from the rendered system prompt when structured options are unavailable.
 *
 * @param systemPrompt Rendered system prompt.
 * @returns Skill detail items.
 */
export function createPromptSkillItems(systemPrompt: string): ContextUsageDetailItem[] {
  const matches = systemPrompt.matchAll(/<skill>\s*<name>([^<]+)<\/name>[\s\S]*?<description>([\s\S]*?)<\/description>[\s\S]*?<location>([^<]+)<\/location>\s*<\/skill>/gmu);
  return Array.from(matches).map((match) => ({
    label: unescapeXml(match[1] ?? "unknown"),
    tokens: estimateTokensFromText(formatPromptSkillEntry(match[1] ?? "", match[2] ?? "", match[3] ?? "")),
  }));
}

/**
 * Unescapes XML entities emitted by Pi skill formatting.
 *
 * @param value Escaped XML value.
 * @returns Plain value.
 */
function unescapeXml(value: string): string {
  return value.replace(/&lt;/gu, "<").replace(/&gt;/gu, ">").replace(/&quot;/gu, '"').replace(/&apos;/gu, "'").replace(/&amp;/gu, "&");
}

/**
 * Formats a skill entry exactly as it appears inside Pi's skills prompt block.
 *
 * @param name Skill name.
 * @param description Skill description.
 * @param filePath Skill file path.
 * @returns Rendered skill XML prompt entry.
 */
function formatPromptSkillEntry(name: string, description: string, filePath: string): string {
  return [`  <skill>`, `    <name>${name}</name>`, `    <description>${description}</description>`, `    <location>${filePath}</location>`, `  </skill>`].join("\n");
}
