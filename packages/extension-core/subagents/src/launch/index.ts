/**
 * Process-launch layer for the subagents extension.
 *
 * Spawns a subagent run as a separate operating-system process: a headless pi
 * process pointed at the child's own session file, started as its own process-group
 * leader (detached) and unref'd. The child argv is the one-shot headless form plus a
 * session argument, the mandatory child-side extension, and the profile-derived
 * flags; the task is passed by artifact-file reference and approval is disabled.
 * See context/extension/subagents/process-launch.md.
 */

export {
	buildChildArgv,
	EXTENSION_FLAG,
	HEADLESS_PRINT_FLAG,
	NO_APPROVE_FLAG,
	SESSION_FLAG,
} from "./build-argv";
export { PI_COMMAND_ENV_VAR, resolvePiInvocation } from "./resolve-invocation";
export { spawnSubagent } from "./spawn";
export { spawnChildProcess } from "./spawn-child";
export { writeTaskArtifact } from "./task-artifact";
export type {
	BuildChildArgvInput,
	PiInvocation,
	SpawnChildProcessOptions,
	SpawnedChildProcess,
	SpawnedSubagent,
	SpawnSubagentOptions,
} from "./types";
