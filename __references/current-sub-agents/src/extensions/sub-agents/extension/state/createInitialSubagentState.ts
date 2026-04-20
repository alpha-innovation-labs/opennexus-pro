import type { SubagentState } from "../../vendor/types.js";

/**
 * Creates the initial mutable runtime state for the subagents extension.
 *
 * @returns Fresh extension runtime state.
 */
export function createInitialSubagentState(): SubagentState {
	return {
		baseCwd: process.cwd(),
		currentSessionId: null,
		asyncJobs: new Map(),
		cleanupTimers: new Map(),
		lastUiContext: null,
		poller: null,
		completionSeen: new Map(),
		watcher: null,
		watcherRestartTimer: null,
		resultFileCoalescer: {
			schedule: () => false,
			clear: () => {},
		},
	};
}
