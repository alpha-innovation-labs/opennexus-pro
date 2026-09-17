import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname } from "node:path";
import type { FileEntry, SessionHeader } from "@earendil-works/pi-coding-agent";
import { parseSessionEntries } from "@earendil-works/pi-coding-agent";
import {
	EXTENSION_FLAG,
	HEADLESS_PRINT_FLAG,
	NO_APPROVE_FLAG,
	resolvePiInvocation,
	SESSION_FLAG,
	spawnChildProcess,
	writeTaskArtifact,
} from "../launch";
import type { SubagentLaunchConfig, SubagentLaunchMetadata } from "../session";
import {
	readSubagentLaunchConfig,
	SUBAGENT_LAUNCH_CUSTOM_TYPE,
} from "../session";
import type {
	BuildResumeArgvInput,
	BuiltResumeArgv,
	ResolveResumeLaunchConfigOptions,
	ResumedSubagent,
	ResumeLaunchConfig,
	ResumeSubagentOptions,
} from "./types";

/**
 * Resume a run: re-spawn the session file with the configuration the run was
 * launched with.
 *
 * The conversation is already in the session file; the launch configuration
 * is in the file's metadata entry. Resume reads the metadata, rebuilds the
 * argv, and starts a fresh process pointed at the existing file. The run
 * continues from where it left off because the process is new but the state
 * is not.
 *
 * The metadata sources fall back in order:
 *
 * 1. **The child's own file.** The launch-metadata entry seeded into the
 *    child's session file is authoritative when present.
 * 2. **The parent's session file.** The entries of the parent's session file
 *    that recorded the launch (matched to this run by the child's session id,
 *    read from the child's header or supplied explicitly).
 * 3. **An explicitly requested mode.** A last resort that rebuilds a minimal
 *    configuration (working directory and mode) from the session file's
 *    header, when no metadata can be found.
 *
 * Target: context/extension/subagents/stop-resume.md (resume).
 */

/** What a resume can learn from a child's session file header. */
interface ChildHeaderInfo {
	readonly id?: string;
	readonly cwd?: string;
	readonly parentSession?: string;
}

/** A launch-metadata entry read from a parent's session file. */
interface ParentLaunchEntry {
	readonly sessionId?: string;
	readonly config: SubagentLaunchConfig;
}

/**
 * Reduce the parent's environment to a plain string record, dropping any
 * value that is `undefined` (Node may carry `undefined` entries that `spawn`
 * would reject).
 */
function toEnvRecord(env: NodeJS.ProcessEnv): Record<string, string> {
	const out: Record<string, string> = {};
	for (const [key, value] of Object.entries(env)) {
		if (value !== undefined) out[key] = value;
	}
	return out;
}

/**
 * Read the header of a child's session file, best-effort.
 *
 * The file is parsed without validation; every field is read defensively so a
 * malformed header degrades to an unknown field, not a crash. Returns `null`
 * when the file is missing, unreadable, or carries no header.
 */
function readChildHeaderInfo(sessionPath: string): ChildHeaderInfo | null {
	let fileEntries: FileEntry[];
	try {
		fileEntries = parseSessionEntries(readFileSync(sessionPath, "utf8"));
	} catch {
		return null;
	}
	const header = fileEntries.find((entry) => entry.type === "session");
	if (header === undefined) return null;
	const sessionHeader = header as SessionHeader;
	return {
		...(typeof sessionHeader.id === "string" ? { id: sessionHeader.id } : {}),
		...(typeof sessionHeader.cwd === "string"
			? { cwd: sessionHeader.cwd }
			: {}),
		...(typeof sessionHeader.parentSession === "string"
			? { parentSession: sessionHeader.parentSession }
			: {}),
	};
}

/**
 * Read the launch-metadata entries out of a parent's session file.
 *
 * Skips malformed entries (a wrong version, a non-object config, or a config
 * missing the two fields a resume needs — a working directory and a mode) so
 * one bad entry never poisons the source.
 */
function readParentLaunchEntries(
	parentSessionPath: string,
): ParentLaunchEntry[] {
	let fileEntries: FileEntry[];
	try {
		fileEntries = parseSessionEntries(readFileSync(parentSessionPath, "utf8"));
	} catch {
		return [];
	}
	const entries: ParentLaunchEntry[] = [];
	for (const entry of fileEntries) {
		if (entry.type !== "custom") continue;
		if (entry.customType !== SUBAGENT_LAUNCH_CUSTOM_TYPE) continue;
		const data: unknown = (entry as { readonly data?: unknown }).data;
		if (typeof data !== "object" || data === null) continue;
		const metadata = data as SubagentLaunchMetadata;
		if (metadata.version !== 1) continue;
		const config = metadata.config;
		if (typeof config !== "object" || config === null) continue;
		if (typeof config.cwd !== "string") continue;
		if (typeof config.mode !== "string") continue;
		entries.push({
			...(typeof metadata.sessionId === "string"
				? { sessionId: metadata.sessionId }
				: {}),
			config,
		});
	}
	return entries;
}

/**
 * Pick the parent entry that recorded this run.
 *
 * Matched by the child's session id when it is known; with an unknown id,
 * only an unambiguous single entry is a safe match — multiple entries cannot
 * be attributed to this run.
 */
function matchParentLaunchEntry(
	entries: readonly ParentLaunchEntry[],
	sessionId: string | undefined,
): SubagentLaunchConfig | null {
	if (entries.length === 0) return null;
	if (sessionId !== undefined) {
		const match = entries.find((entry) => entry.sessionId === sessionId);
		return match === undefined ? null : match.config;
	}
	return entries.length === 1 ? entries[0].config : null;
}

/**
 * Resolve the launch configuration a resume rebuilds the argv from.
 *
 * Tries the metadata sources in order and returns the first that yields a
 * configuration: the child's own file, then the entries of the parent's
 * session file that recorded the launch, then an explicitly requested mode.
 * The persisted metadata is authoritative; the explicit mode is only a
 * fallback when no metadata can be found.
 *
 * @param sessionPath The run's session file (the child's own file).
 * @param options The explicit-mode fallback, and the session id and parent
 *   session path to use when the child's file is missing.
 * @returns The resolved launch configuration and the source it came from.
 * @throws When no source yields a configuration.
 */
export function resolveResumeLaunchConfig(
	sessionPath: string,
	options: ResolveResumeLaunchConfigOptions = {},
): ResumeLaunchConfig {
	const headerInfo = readChildHeaderInfo(sessionPath);

	// 1. The child's own file is authoritative when it carries launch metadata.
	const childConfig = readSubagentLaunchConfig(sessionPath);
	if (childConfig !== null) {
		return { config: childConfig, source: "child-file" };
	}

	// 2. The entries of the parent's session file that recorded the launch.
	const sessionId = headerInfo?.id ?? options.sessionId;
	const parentSession = headerInfo?.parentSession ?? options.parentSession;
	if (parentSession !== undefined) {
		const match = matchParentLaunchEntry(
			readParentLaunchEntries(parentSession),
			sessionId,
		);
		if (match !== null) {
			return { config: match, source: "parent-entries" };
		}
	}

	// 3. An explicitly requested mode, as a last resort.
	if (options.mode !== undefined) {
		const cwd = headerInfo?.cwd;
		if (cwd === undefined) {
			throw new Error(
				`Cannot resume ${sessionPath} in mode "${options.mode}": the ` +
					"session file has no readable header with a working directory.",
			);
		}
		return { config: { cwd, mode: options.mode }, source: "explicit-mode" };
	}

	throw new Error(
		`No launch metadata found for ${sessionPath}: the child's file carries ` +
			"no launch-metadata entry, no parent session entry matched, and no " +
			"explicit mode was requested.",
	);
}

/**
 * Build the resumed child's pi-level argv from the resolved launch
 * configuration.
 *
 * The argv mirrors the launch layer's shape, pointed at the existing session
 * file and carrying the recorded profile flags:
 *
 *   --print                 (one-shot headless form)
 *   --session <session>     (the existing session file)
 *   --extension <ext>       (the mandatory child-side extension)
 *   --no-approve            (approval disabled: no operator to answer a prompt)
 *   <profile flags>         (the recorded flags)
 *   @<task artifact path>   (the task reference, when one resolves)
 *
 * The task reference resolves in order: the launch configuration's recorded
 * artifact path (the faithful rebuild), then a fresh artifact written from a
 * resume prompt, then none.
 *
 * @param input The session file, the child extension, the resolved launch
 *   configuration, and an optional resume prompt and artifact directory.
 * @returns The pi-level argv and the artifact it references.
 * @throws When a resume prompt is given but is empty.
 */
export function buildResumeArgv(input: BuildResumeArgvInput): BuiltResumeArgv {
	const { sessionPath, childExtension, config } = input;

	// Resolve the task reference: the recorded artifact first, then a fresh
	// resume artifact, then none.
	let taskArtifactPath: string | null = config.taskArtifactPath ?? null;
	if (taskArtifactPath === null && input.resumeTask !== undefined) {
		if (input.resumeTask.trim().length === 0) {
			throw new Error("A resume task must be non-empty.");
		}
		const artifact = writeTaskArtifact({
			dir: input.artifactDir ?? dirname(sessionPath),
			task: input.resumeTask,
			// A distinct name fragment marks the file as a resume artifact
			// rather than the original task artifact.
			name: `resume-${randomUUID().slice(0, 8)}`,
		});
		taskArtifactPath = artifact.path;
	}

	const argv: string[] = [
		HEADLESS_PRINT_FLAG,
		SESSION_FLAG,
		sessionPath,
		EXTENSION_FLAG,
		childExtension,
		NO_APPROVE_FLAG,
		...(config.flags ?? []),
	];
	if (taskArtifactPath !== null) {
		argv.push(`@${taskArtifactPath}`);
	}

	return { argv, taskArtifactPath };
}

/**
 * Resume a run: resolve its launch metadata, rebuild the argv, and re-spawn
 * a fresh detached, unref'd headless pi child pointed at the existing session
 * file.
 *
 * The resumed child is a new process in the working directory the run was
 * launched in, with the same argv the run was launched with (the existing
 * session file in place of any new one) and an environment of the current
 * parent environment overlaid with the recorded configuration environment —
 * mirroring how the launch layer composes the child environment. The caller
 * owns the child's `exit` and `error` events; the running-registry and
 * completion layers attach them, exactly as for a fresh launch.
 *
 * @param sessionPath The run's session file to re-spawn (the durable record).
 * @param options The metadata options, the child extension, an optional
 *   resume prompt, and the spawn options.
 * @returns The resumed child and its launch metadata.
 * @throws When the launch metadata cannot be resolved.
 */
export function resumeSubagentRun(
	sessionPath: string,
	options: ResumeSubagentOptions,
): ResumedSubagent {
	const launch = resolveResumeLaunchConfig(sessionPath, options.metadata);
	const built = buildResumeArgv({
		sessionPath,
		childExtension: options.childExtension,
		config: launch.config,
		...(options.resumeTask !== undefined
			? { resumeTask: options.resumeTask }
			: {}),
		...(options.artifactDir !== undefined
			? { artifactDir: options.artifactDir }
			: {}),
	});

	const invocation = resolvePiInvocation({
		command: options.command,
		baseArgs: options.baseArgs,
	});

	// The child environment is the current parent environment, overlaid with
	// the recorded configuration environment. `spawn` replaces the child
	// environment, so the parent environment must be included for PATH and
	// provider credentials to reach the child.
	const env: Record<string, string> = {
		...toEnvRecord(process.env),
		...launch.config.env,
	};

	const cwd = launch.config.cwd;

	const { child, pid } = spawnChildProcess({
		command: invocation.command,
		args: [...invocation.baseArgs, ...built.argv],
		env,
		cwd,
		stdio: options.stdio,
		detached: options.detached,
	});

	return {
		launch,
		command: invocation.command,
		baseArgs: invocation.baseArgs,
		argv: built.argv,
		taskArtifactPath: built.taskArtifactPath,
		child,
		pid,
		sessionPath,
		cwd,
		env,
		spawnedAt: new Date().toISOString(),
	};
}
