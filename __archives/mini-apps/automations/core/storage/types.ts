/** Persisted automation definition. */
export type AutomationRecord = {
	id: string;
	name: string;
	scheduleText: string;
	cronExpression: string;
	prompt: string;
	cwd: string;
	enabled: boolean;
	createdAt: string;
	updatedAt: string;
	nextRunAt: string | null;
};

/** Persisted scheduled automation execution. */
export type AutomationRunRecord = {
	id: string;
	automationId: string;
	status: "running" | "success" | "failed" | "skipped";
	startedAt: string;
	finishedAt: string | null;
	exitCode: number | null;
	pid: number | null;
	sessionPath: string | null;
	logPath: string | null;
	error: string | null;
};

/** Writable automation fields accepted by create and edit commands. */
export type AutomationInput = {
	name: string;
	scheduleText: string;
	cronExpression: string;
	prompt: string;
	cwd: string;
	enabled: boolean;
	nextRunAt: string | null;
};
