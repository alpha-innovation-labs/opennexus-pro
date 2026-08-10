export type SystemPromptState = {
	getOverride: () => string | undefined;
	setOverride: (prompt: string) => void;
	reset: () => void;
};
