export type LineChatMessage = {
	role: "user" | "assistant" | "tool" | "thinking" | "error";
	content: string;
	timestamp: string;
	toolCallId?: string;
	toolName?: string;
	args?: Record<string, unknown>;
	result?: {
		isError: boolean;
		content?: unknown;
		details?: unknown;
	};
};

export type LineChatSessionMetadata = {
	kind: "md-editor-line-chat";
	hiddenFromResume: true;
	filePath: string;
	lineNumber: number;
	lineText: string;
	lineFingerprint: string;
	status: "active" | "obsolete";
	lastContextContentHash: string;
	lastContextMtimeMs: number;
	updatedAt: string;
};

export type LineChatSession = {
	sessionId: string;
	metadata: LineChatSessionMetadata;
	messages: LineChatMessage[];
};
