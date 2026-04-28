export type CmuxSessionRegistryEntry = {
	workspaceId?: string;
	surfaceId: string;
	sessionId: string;
	sessionTitle?: string;
	sessionFile?: string;
	pid: number;
	updatedAt: string;
};

export type CmuxSessionRegistry = {
	version: 1;
	entries: CmuxSessionRegistryEntry[];
};
