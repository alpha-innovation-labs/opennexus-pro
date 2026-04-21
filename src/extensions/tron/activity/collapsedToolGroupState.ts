export type CollapsedToolGroupStats = {
	toolCallIds: string[];
	toolNames: Map<string, string>;
	diffToolCallIds: Set<string>;
	diffCount: number;
	startedAt?: number;
	finishedAt?: number;
	firstAssistantTimestamp?: number;
	lastAssistantTimestamp?: number;
};

/**
 * Maps each tool call id to the leader of its collapsed group.
 */
export const collapsedToolGroupLeaderByToolCallId = new Map<string, string>();

/**
 * Stores summary stats for each collapsed tool group.
 */
export const collapsedToolGroupStatsByLeader = new Map<string, CollapsedToolGroupStats>();
