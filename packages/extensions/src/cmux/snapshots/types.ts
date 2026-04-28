export type CmuxSavedPane = {
	title: string;
	sessionId?: string;
	sessionTitle?: string;
};

export type CmuxSavedWorkspace = {
	title: string;
	panes: CmuxSavedPane[];
};

export type CmuxSavedSession = {
	id: string;
	name: string;
	createdAt: string;
	lines: string[];
	workspaces?: CmuxSavedWorkspace[];
};

export type CmuxSavedSessionStore = {
	version: 1;
	sessions: CmuxSavedSession[];
};
