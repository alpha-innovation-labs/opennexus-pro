import type { AutocompleteItem } from "@earendil-works/pi-tui";

/**
 * Tool call block shape found inside assistant messages.
 */
export type ToolCallBlock = {
	type: "toolCall";
	id: string;
	name: string;
	arguments: Record<string, unknown>;
};

/**
 * Collected tool call metadata for the modal.
 */
export type ToolCallInfo = {
	toolCallId: string;
	toolName: string;
	arguments: Record<string, unknown>;
	assistantIndex: number;
	assistantPreview: string;
	assistantThinking: string;
	userIndex: number;
	userPreview: string;
	result?: {
		isError: boolean;
		content?: unknown;
		details?: unknown;
	};
};

/**
 * Group of tool calls tied to one user message.
 */
export type ToolCallGroup = {
	userIndex: number;
	userPreview: string;
	userTimestamp?: number;
	lastAssistantTimestamp?: number;
	toolCalls: ToolCallInfo[];
};

/**
 * Modal source payload built from the current branch.
 */
export type BranchToolCalls = {
	items: AutocompleteItem[];
	groups: ToolCallGroup[];
	toolCalls: Map<string, ToolCallInfo>;
};
