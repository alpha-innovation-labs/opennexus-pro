import type { NexusRestoreCommand } from "./createNexusResumeCommand.js";

export type CmuxSessionRegistryEntry = {
	workspaceId?: string;
	surfaceId: string;
	sessionId: string;
	sessionTitle?: string;
	sessionFile?: string;
	cwd?: string;
	pid: number;
	restoreCommand?: NexusRestoreCommand;
	updatedAt: string;
};

export type CmuxSessionRegistry = {
	version: 1;
	entries: CmuxSessionRegistryEntry[];
};
