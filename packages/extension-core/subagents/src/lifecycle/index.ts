/**
 * Stop/resume layer for the subagents extension.
 *
 * A run can be stopped while running and resumed after it has ended. Stop
 * acts on the process group; resume acts on the session file. Stop aborts
 * the watcher loop and signals the child's whole process group (the negative
 * pid) with a terminate signal, escalating to a kill signal after a grace
 * period when the group does not die; an interactive run's terminal surface
 * is closed as well. Resume reads the run's launch metadata (the child's own
 * file, then the parent's launch entries, then an explicit mode), rebuilds
 * the argv, and re-spawns a fresh detached, unref'd child pointed at the
 * existing session file.
 *
 * See context/extension/subagents/stop-resume.md.
 */

export {
	DEFAULT_STOP_ESCALATE_SIGNAL,
	DEFAULT_STOP_GRACE_MS,
	DEFAULT_STOP_POLL_MS,
	DEFAULT_STOP_SIGNAL,
	isProcessGroupAlive,
	signalProcessGroup,
	stopProcessGroup,
} from "./group-signal";
export {
	buildResumeArgv,
	resolveResumeLaunchConfig,
	resumeSubagentRun,
} from "./resume";
export { stopSubagentRun } from "./stop";
export type {
	BuildResumeArgvInput,
	BuiltResumeArgv,
	ResolveResumeLaunchConfigOptions,
	ResumedSubagent,
	ResumeLaunchConfig,
	ResumeMetadataSource,
	ResumeSubagentOptions,
	SignalProcessGroupResult,
	StopProcessGroupOptions,
	StopProcessGroupResult,
	StopSubagentRunOptions,
	StopSubagentRunResult,
	TerminalSurface,
} from "./types";
