export type CmuxSurface = {
	id?: string;
	ref: string;
	title: string;
	type: string;
	selected: boolean;
	index: number;
};

export type CmuxPane = {
	id?: string;
	ref: string;
	focused: boolean;
	index: number;
	surfaces: CmuxSurface[];
};

export type CmuxWorkspace = {
	id?: string;
	ref: string;
	title: string;
	selected: boolean;
	index: number;
	panes: CmuxPane[];
};

export type CmuxWorkspaceShellView = {
	workspaces: CmuxWorkspace[];
};
