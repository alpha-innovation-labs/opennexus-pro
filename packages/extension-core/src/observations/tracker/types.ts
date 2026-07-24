/**
 * Persisted raw message captured by the observations tracker.
 */
export type StoredObservationMessage = {
	index: number;
	entryId?: string;
	timestamp: number;
	role: "user" | "assistant";
	text: string;
	thinking?: string;
};

/**
 * Raw message history used to derive observations.
 */
export type ObservationMessageStore = {
	conversationId: string;
	cwd: string;
	sessionFile: string | null;
	updatedAt: number;
	messages: StoredObservationMessage[];
};

/**
 * One high-level topic in the rendered observations file.
 */
export type ObservationTopic = {
	index: number;
	title: string | string[];
	startedAt: number;
	sourceMessageIndex: number;
	userMessageIndexes?: number[];
	userMessages: string[];
	assistantBullets: string[];
};

/**
 * Structured state rendered into the observations markdown file.
 */
export type ObservationState = {
	conversationId: string;
	cwd: string;
	sessionFile: string | null;
	updatedAt: number;
	messageCount?: number;
	summary: string;
	topics: ObservationTopic[];
};
