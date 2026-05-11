/** Serialized automation daemon process state. */
export type AutomationDaemonState = {
	pid: number;
	startedAt: string;
};

/** Serialized automation daemon heartbeat. */
export type AutomationDaemonHeartbeat = {
	pid: number;
	updatedAt: string;
};

/** Automation daemon status shown by CLI commands. */
export type AutomationDaemonStatus = {
	running: boolean;
	pid: number | null;
	startedAt: string | null;
	heartbeatAt: string | null;
	statePath: string;
	logPath: string;
	dbPath: string;
};
