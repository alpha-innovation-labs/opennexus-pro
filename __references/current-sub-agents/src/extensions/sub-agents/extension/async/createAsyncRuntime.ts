import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { createAsyncJobTracker } from "../../vendor/async-job-tracker.js";
import { createResultWatcher } from "../../vendor/result-watcher.js";
import { ASYNC_DIR, RESULTS_DIR } from "../../vendor/types.js";
import type { SubagentState } from "../../vendor/types.js";

/**
 * Starts the async job tracker and result watcher runtime.
 *
 * @param pi Pi extension API.
 * @param state Mutable extension state.
 * @returns Runtime control callbacks.
 */
export function createAsyncRuntime(pi: ExtensionAPI, state: SubagentState): {
	stopResultWatcher: () => void;
	ensurePoller: () => void;
	resetJobs: ReturnType<typeof createAsyncJobTracker>["resetJobs"];
	handleStarted: ReturnType<typeof createAsyncJobTracker>["handleStarted"];
	handleComplete: ReturnType<typeof createAsyncJobTracker>["handleComplete"];
} {
	const { startResultWatcher, primeExistingResults, stopResultWatcher } = createResultWatcher(pi, state, RESULTS_DIR, 10 * 60 * 1000);
	startResultWatcher();
	primeExistingResults();

	const { ensurePoller, handleStarted, handleComplete, resetJobs } = createAsyncJobTracker(state, ASYNC_DIR);
	return { stopResultWatcher, ensurePoller, resetJobs, handleStarted, handleComplete };
}
