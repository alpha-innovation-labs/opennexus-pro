import type { BuildSystemPromptOptions } from "@earendil-works/pi-coding-agent";

/**
 * Minimal shape of a tool definition as sent to the API.
 * Used for accurate token estimation of the tools array.
 */
export interface ToolDefinitionInfo {
	name: string;
	description: string;
	parameters: unknown;
}

export interface ContextUsageRuntimeSnapshot {
	usage: {
		tokens: number | null;
		contextWindow: number;
		percent: number | null;
	} | null;
	modelName: string;
	systemPrompt: string;
	systemPromptOptions?: BuildSystemPromptOptions;
	messages: unknown[];
	/** Full tool definitions (name + description + parameters) sent to the API. */
	toolDefinitions?: ToolDefinitionInfo[];
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
