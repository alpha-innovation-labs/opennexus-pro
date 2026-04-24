export type WorkingPromptTimerContext = {
	hasUI: boolean;
	ui: {
		setWorkingMessage(message?: string): void;
	};
};

export type WorkingPromptTimer = {
	stop(): void;
};
