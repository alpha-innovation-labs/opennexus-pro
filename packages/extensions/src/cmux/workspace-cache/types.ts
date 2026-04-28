export type CmuxWorkspaceShellLinesCache = {
	lines?: string[];
	refreshedAt?: number;
	pending?: Promise<string[]>;
};
