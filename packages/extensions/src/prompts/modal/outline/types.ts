export interface SystemPromptOutlineChild {
	label: string;
	lineIndex: number;
}

export interface SystemPromptOutlineSection {
	label: string;
	lineIndex: number;
	children: SystemPromptOutlineChild[];
}

export interface SystemPromptOutline {
	sections: SystemPromptOutlineSection[];
}
