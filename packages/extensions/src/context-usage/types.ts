import type { BuildSystemPromptOptions } from "@mariozechner/pi-coding-agent";

export interface ContextUsageRuntimeSnapshot {
  usage: { tokens: number | null; contextWindow: number; percent: number | null } | null;
  modelName: string;
  systemPrompt: string;
  systemPromptOptions?: BuildSystemPromptOptions;
  messages: unknown[];
}

export interface ContextUsageCategory {
  marker: string;
  label: string;
  tokens: number;
  percent: number;
}

export interface ContextUsageDetailItem {
  label: string;
  tokens: number;
}

export interface ContextUsageReport {
  title: string;
  modelName: string;
  usedTokens: number | null;
  contextWindow: number;
  usedPercent: number | null;
  categories: ContextUsageCategory[];
  systemTools: ContextUsageDetailItem[];
  mcpTools: ContextUsageDetailItem[];
  agentsFiles: ContextUsageDetailItem[];
  skills: ContextUsageDetailItem[];
}
