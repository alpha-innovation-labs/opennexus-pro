export interface StartupHeroStatus {
	activeSkillCount: number;
	agentsMdLoaded: boolean;
	enabledExtensionCount: number;
}

export interface StartupHeroTheme {
	fg(name: string, value: string): string;
	bold?(value: string): string;
}
