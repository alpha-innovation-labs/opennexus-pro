/** Prepared SQLite statement used by social automation storage. */
export type SocialAutomationStatement = {
	run: (...params: unknown[]) => unknown;
	all: (...params: unknown[]) => unknown[];
	get: (...params: unknown[]) => unknown;
};

/** SQLite database subset supported by Node and Bun runtimes. */
export type SocialAutomationDatabase = {
	exec: (sql: string) => unknown;
	prepare: (sql: string) => SocialAutomationStatement;
	close: () => void;
};
