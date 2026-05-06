export type SystemPromptModalAction =
	| { type: "close" }
	| { type: "edit" }
	| { type: "reset" }
	| { type: "update"; prompt: string };
