import { dirname } from "node:path";
import { compileAgentProfile } from "../profile";
import { buildChildArgv } from "./build-argv";
import { resolvePiInvocation } from "./resolve-invocation";
import { spawnChildProcess } from "./spawn-child";
import { writeTaskArtifact } from "./task-artifact";
import type { SpawnedSubagent, SpawnSubagentOptions } from "./types";

/**
 * Reduce the parent's environment to a plain string record, dropping any value that
 * is `undefined` (Node may carry `undefined` entries that `spawn` would reject).
 */
function toEnvRecord(env: NodeJS.ProcessEnv): Record<string, string> {
	const out: Record<string, string> = {};
	for (const [key, value] of Object.entries(env)) {
		if (value !== undefined) out[key] = value;
	}
	return out;
}

/**
 * Launch one subagent run as a detached, unref'd headless pi child.
 *
 * This is the process-launch layer. It composes the two landed layers (the profile
 * layer that compiles the profile into the child argv and environment, and the
 * session layer that seeded the run's durable session file) into an actual OS
 * process:
 *
 * 1. Compile the profile into its child argv, environment, and working directory.
 * 2. Write the task text to an artifact file and reference it with `@<path>` rather
 *    than inlining it into the argv.
 * 3. Build the pi-level argv: the one-shot headless form plus a session argument,
 *    the mandatory child-side extension, approval disabled, the profile flags, and
 *    the task artifact reference.
 * 4. Resolve the pi invocation (defaulting to the running process) and spawn the
 *    child detached and unref'd, pointed at the child's own session file.
 *
 * The returned handle carries the child process, its pid, every path, and the exact
 * argv the run was launched with. The caller owns the child's `exit`/`error` events;
 * the running-registry and completion layers (later) attach them.
 *
 * @param options The launch inputs.
 * @returns The spawned child and its launch metadata.
 */
export function spawnSubagent(options: SpawnSubagentOptions): SpawnedSubagent {
	if (options.task.trim().length === 0) {
		throw new Error("A subagent launch requires a non-empty task.");
	}

	// 1. Compile the profile into its child invocation, if a profile is given.
	const compiled = options.profile
		? compileAgentProfile(options.profile)
		: { argv: [], env: {}, cwd: undefined };

	// 2. Write the task to an artifact file (next to the session file by default) so
	//    the argv carries a reference, not the prompt text.
	const artifactDir = options.artifactDir ?? dirname(options.sessionPath);
	const artifact = writeTaskArtifact({
		dir: artifactDir,
		task: options.task,
		name: options.artifactName,
	});

	// 3. Build the pi-level argv.
	const argv = buildChildArgv({
		sessionPath: options.sessionPath,
		childExtension: options.childExtension,
		taskArtifactPath: artifact.path,
		profileFlags: compiled.argv,
	});

	// The child env is the parent env, overlaid by the profile env, then any explicit
	// override. `spawn` replaces the child's environment, so the parent env must be
	// included for PATH and provider credentials to reach the child.
	const env: Record<string, string> = {
		...toEnvRecord(process.env),
		...compiled.env,
		...options.env,
	};

	// The working directory: an explicit override, else the profile's, else the cwd.
	const cwd = options.cwd ?? compiled.cwd ?? process.cwd();

	// 4. Resolve the pi invocation and spawn detached + unref'd.
	const invocation = resolvePiInvocation({
		command: options.command,
		baseArgs: options.baseArgs,
	});
	const { child, pid } = spawnChildProcess({
		command: invocation.command,
		args: [...invocation.baseArgs, ...argv],
		env,
		cwd,
		stdio: options.stdio,
		detached: options.detached,
	});

	return {
		child,
		pid,
		sessionPath: options.sessionPath,
		artifactPath: artifact.path,
		childExtension: options.childExtension,
		command: invocation.command,
		baseArgs: invocation.baseArgs,
		argv,
		env,
		cwd,
		spawnedAt: new Date().toISOString(),
	};
}
