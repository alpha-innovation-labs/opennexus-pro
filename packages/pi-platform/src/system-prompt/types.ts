export interface NexusSystemPromptContextFile {
	path: string;
	content: string;
}

export interface NexusSystemPromptSkill {
	name: string;
	description?: string;
	location?: string;
}

export interface NexusSystemPromptOptions {
	appendSystemPrompt?: string;
	contextFiles?: NexusSystemPromptContextFile[];
	customPrompt?: string;
	cwd: string;
	promptGuidelines?: string[];
	selectedTools?: string[];
	skills?: NexusSystemPromptSkill[];
	toolSnippets?: Record<string, string | undefined>;
}
