/**
 * Completion layer for the subagents extension.
 *
 * Detects a run's terminal status from three signals — the process exit, the exit
 * sidecar, and the session tail — and classifies it from the same evidence (the status
 * is a property of the evidence, not of the exit code alone). The sidecar reason
 * overrides the exit code; a run stopped on request is cancelled unless it had already
 * produced a real answer. The stable-summary reaper ends idle auto-exit runs once their
 * last assistant message is stable for a grace period with no new entries.
 *
 * See context/extension/subagents/completion.md.
 */

export { classifyCompletion, isRealFinalMessage } from "./classify";
export {
	extractFinalAssistantMessage,
	type RunTail,
	readRunTail,
} from "./session-tail";
export {
	readExitSidecar,
	SIDECAR_FILE_SUFFIX,
	SIDECAR_VERSION,
	sidecarPathFor,
	writeExitSidecar,
} from "./sidecar";
export {
	type ClassifyCompletionOptions,
	type CompletionEvidence,
	type CompletionWatcherHandle,
	type CompletionWatcherOptions,
	type ExitSidecar,
	FINAL_ANSWER_STOP_REASONS,
	type FinalAssistantMessage,
	type SidecarReason,
	type SidecarTokenUsage,
	type StableSummaryReaperOptions,
	TERMINAL_ERROR_STOP_REASONS,
} from "./types";
export { createCompletionWatcher } from "./watcher";
