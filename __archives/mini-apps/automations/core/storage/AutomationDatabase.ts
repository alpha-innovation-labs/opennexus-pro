/** Prepared SQLite statement used by automations storage. */
export type AutomationStatement = {
	run: (...params: unknown[]) => unknown;
	all: (...params: unknown[]) => unknown[];
	get: (...params: unknown[]) => unknown;
};

/** SQLite database subset supported by Node and Bun runtimes. */
export type AutomationDatabase = {
	exec: (sql: string) => unknown;
	prepare: (sql: string) => AutomationStatement;
	close: () => void;
};
