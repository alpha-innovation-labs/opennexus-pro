export interface SmartEvalQuestionResult {
	question: string;
	passed: boolean;
	explanation?: string;
}

export interface SmartEvalResult {
	assistantTimestamp: number;
	turnId?: string;
	status?: "pending" | "complete" | "failed";
	questions: SmartEvalQuestionResult[];
}

export interface SmartEvalTurn {
	turnId: string;
	userText: string;
	assistantText: string;
	thinkingText: string;
	toolText: string;
	assistantTimestamp: number;
}

export interface StoredSmartEvalTurn extends SmartEvalTurn {
	index: number;
	evaluatedAt: number;
	result: SmartEvalResult;
}

export interface SmartEvalState {
	conversationId: string;
	cwd: string;
	sessionFile: string | null;
	updatedAt: number;
	summary: string;
	turns: StoredSmartEvalTurn[];
}
