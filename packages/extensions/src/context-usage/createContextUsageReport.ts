import type { ContextUsageReport, ContextUsageRuntimeSnapshot } from "./types.js";
import { calculatePercent } from "./calculatePercent.js";
import { createAgentsItems } from "./createAgentsItems.js";
import { createPromptSkillItems } from "./createPromptSkillItems.js";
import { createPromptToolItems } from "./createPromptToolItems.js";
import { createSkillItems } from "./createSkillItems.js";
import { createToolItems } from "./createToolItems.js";
import { estimateTokensFromText } from "./estimateTokensFromText.js";
import { createPiBuiltinToolItems } from "./pi/createPiBuiltinToolItems.js";
import { getPiDefaultCompactionReserveTokens } from "./pi/getPiDefaultCompactionReserveTokens.js";
import { sumTokens } from "./sumTokens.js";

/**
 * Creates a fallback base prompt slice when the live rendered prompt is stale or incomplete.
 *
 * @param options Structured system prompt options from Pi.
 * @returns Base prompt text excluding tools, context files, and skills.
 */
function createFallbackBaseSystemPromptText(options: ContextUsageRuntimeSnapshot["systemPromptOptions"]): string {
  const guidelines = [
    ...(options?.promptGuidelines ?? []),
    "Be concise in your responses",
    "Show file paths clearly when working with files",
  ];
  return [
    options?.customPrompt ?? "You are an expert coding assistant operating inside pi, a coding agent harness. You help users by reading files, executing commands, editing code, and writing new files.",
    "Available tools:",
    "In addition to the tools above, you may have access to other custom tools depending on the project.",
    "Guidelines:",
    ...guidelines.map((guideline) => `- ${guideline}`),
    options?.appendSystemPrompt ?? "",
  ].filter((line) => line.length > 0).join("\n");
}

/**
 * Merges tool items by label while preserving first-seen order.
 *
 * @param primary Primary tool items.
 * @param fallback Fallback Pi tool items.
 * @returns Merged tool items without duplicate labels.
 */
function mergeToolItems(primary: ContextUsageReport["systemTools"], fallback: ContextUsageReport["systemTools"]): ContextUsageReport["systemTools"] {
  const seen = new Set<string>();
  const merged: ContextUsageReport["systemTools"] = [];
  for (const item of [...primary, ...fallback]) {
    if (seen.has(item.label)) continue;
    seen.add(item.label);
    merged.push(item);
  }
  return merged;
}

/**
 * Builds a categorized context usage report from live runtime data.
 *
 * @param snapshot Runtime context usage snapshot.
 * @returns Categorized context usage report.
 */
export async function createContextUsageReport(snapshot: ContextUsageRuntimeSnapshot): Promise<ContextUsageReport> {
  const contextWindow = snapshot.usage?.contextWindow ?? 0;
  const promptMcpTools = createPromptToolItems(snapshot.systemPrompt, true);
  const promptSystemTools = createPromptToolItems(snapshot.systemPrompt, false);
  const structuredMcpTools = createToolItems(snapshot.systemPromptOptions?.toolSnippets, true);
  const structuredSystemTools = createToolItems(snapshot.systemPromptOptions?.toolSnippets, false);
  const piBuiltinTools = await createPiBuiltinToolItems(snapshot.systemPromptOptions?.cwd ?? process.cwd());
  const mcpTools = promptMcpTools.length > 0 ? promptMcpTools : structuredMcpTools;
  const systemTools = promptSystemTools.length > 0 ? promptSystemTools : mergeToolItems(structuredSystemTools, piBuiltinTools);
  const agentsFiles = createAgentsItems(snapshot.systemPromptOptions, snapshot.systemPrompt);
  const structuredSkills = await createSkillItems(snapshot.systemPromptOptions);
  const skills = structuredSkills.length > 0 ? structuredSkills : createPromptSkillItems(snapshot.systemPrompt);
  const knownSystemTokens = sumTokens(systemTools) + sumTokens(mcpTools) + sumTokens(agentsFiles) + sumTokens(skills);
  const renderedSystemPromptTokens = estimateTokensFromText(snapshot.systemPrompt);
  const fallbackBaseSystemPromptTokens = estimateTokensFromText(createFallbackBaseSystemPromptText(snapshot.systemPromptOptions));
  const systemPromptTokens = Math.max(0, Math.max(renderedSystemPromptTokens, knownSystemTokens + fallbackBaseSystemPromptTokens) - knownSystemTokens);
  const messagesTokens = estimateTokensFromText(JSON.stringify(snapshot.messages));
  const piReserveTokens = await getPiDefaultCompactionReserveTokens();
  const reserveTokens = contextWindow > 0 ? Math.min(piReserveTokens, contextWindow) : piReserveTokens;
  const measuredUsedTokens = snapshot.usage?.tokens ?? null;
  const estimatedUsedTokens = systemPromptTokens + sumTokens(systemTools) + sumTokens(mcpTools) + sumTokens(agentsFiles) + sumTokens(skills) + messagesTokens;
  const usedTokens = measuredUsedTokens ?? estimatedUsedTokens;
  const freeTokens = Math.max(0, contextWindow - usedTokens - reserveTokens);

  return {
    title: "Context Usage",
    modelName: snapshot.modelName,
    usedTokens,
    contextWindow,
    usedPercent: snapshot.usage?.percent ?? calculatePercent(usedTokens, contextWindow),
    categories: [
      { marker: "⛁", label: "System prompt", tokens: systemPromptTokens, percent: calculatePercent(systemPromptTokens, contextWindow) },
      { marker: "⛁", label: "System tools", tokens: sumTokens(systemTools), percent: calculatePercent(sumTokens(systemTools), contextWindow) },
      { marker: "⛁", label: "MCP tools", tokens: sumTokens(mcpTools), percent: calculatePercent(sumTokens(mcpTools), contextWindow) },
      { marker: "⛁", label: "AGENTS.md", tokens: sumTokens(agentsFiles), percent: calculatePercent(sumTokens(agentsFiles), contextWindow) },
      { marker: "⛁", label: "Skills", tokens: sumTokens(skills), percent: calculatePercent(sumTokens(skills), contextWindow) },
      { marker: "⛁", label: "Messages", tokens: messagesTokens, percent: calculatePercent(messagesTokens, contextWindow) },
      { marker: "⛶", label: "Free space", tokens: freeTokens, percent: calculatePercent(freeTokens, contextWindow) },
      { marker: "⛝", label: "Autocompact buffer", tokens: reserveTokens, percent: calculatePercent(reserveTokens, contextWindow) },
    ],
    systemTools,
    mcpTools,
    agentsFiles,
    skills,
  };
}
