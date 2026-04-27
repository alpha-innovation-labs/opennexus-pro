export type ProviderName = "anthropic" | "copilot" | "gemini" | "antigravity" | "codex" | "kiro" | "zai" | "minimax" | "minimax-cn";

export type ProviderModel = {
	provider?: string;
	id?: string;
} | undefined;

export type RateWindow = {
	label: string;
	usedPercent: number;
	resetDescription?: string;
	resetAt?: string;
};

export type UsageSnapshot = {
	provider: ProviderName;
	windows: RateWindow[];
	fetchedAt: number;
	error?: string;
};

export type UsagePair = {
	provider: ProviderName;
	daily?: number;
	weekly?: number;
};
