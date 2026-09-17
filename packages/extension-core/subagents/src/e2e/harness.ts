import { spawn, type ChildProcess } from "node:child_process";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
	E2E_API_KEY_ENV_VAR,
	E2E_BASE_URL_DEFAULT,
	E2E_BASE_URL_ENV_VAR,
	E2E_CHILD_MARKER_FILE,
	E2E_HARD_TIMEOUT_MS,
	E2E_HOLDER_RUN_NAME,
	E2E_HOLDER_SLEEP_SECONDS,
	E2E_MODEL_DEFAULT,
	E2E_MODEL_ENV_VAR,
	E2E_PARENT_MARKER,
	E2E_PI_COMMAND_ENV_VAR,
	E2E_PROVIDER_ID,
	E2E_RUN_NAME,
	E2E_CHILD_MARKER,
	PI_AGENT_DIR_ENV_VAR,
} from "./constants";

/**
 * The headless end-to-end harness for the subagents background lifecycle.
 *
 * A validation run starts the system in the one-shot headless form (the same
 * `--print` form a child uses), with the subagents extension loaded and a
 * temporary session directory, gives the parent a fixed task that launches a
 * child, waits for the parent process to exit under a hard timeout (signalling
 * the whole process tree on the way out), and then returns the paths of the
 * resulting session files so the oracle can read them.
 *
 * The harness owns the run environment end to end: a temporary workspace
 * (the parent's cwd, where the child's session files and the marker file land),
 * a temporary pi agent directory (a `models.json` plus `settings.json` that
 * point the model at a configured OpenAI-compatible endpoint, exported as
 * `PI_CODING_AGENT_DIR` so the parent and every spawned child inherit it), and
 * a hard timeout that kills the parent's process group and sweeps any orphan.
 *
 * The harness never asserts: it produces the run and its artifacts. Assertions
 * are structural and live in the test, reading the session files as the oracle.
 *
 * Target: context/extension/subagents/autonomous-testing.md.
 */

/** The model configuration the harness resolves from the environment. */
export interface HeadlessE2EModel {
	readonly providerId: string;
	readonly modelId: string;
	readonly baseUrl: string;
	readonly apiKey: string;
}

/** Options for a headless validation run. */
export interface HeadlessE2EOptions {
	/** The model target. Defaults to the `NEXUS_E2E_*` environment variables. */
	readonly model?: HeadlessE2EModel;
	/** The pi command that launches the headless parent. Default: `NEXUS_E2E_PI_COMMAND` or `pi`. */
	readonly piCommand?: string;
	/** The hard timeout for the parent run. Default: {@link E2E_HARD_TIMEOUT_MS}. */
	readonly timeoutMs?: number;
	/** The base directory for the temp run directory. Default: `os.tmpdir()`. */
	readonly baseDir?: string;
}

/** The outcome of a headless validation run. */
export interface HeadlessE2EResult {
	/** The unique id for this run (also the temp directory name fragment). */
	readonly runId: string;
	/** The temp root of the run; contains everything the run produced. */
	readonly tempDir: string;
	/** The parent's cwd (the child's cwd, where `.subagents/` and the marker file land). */
	readonly workspaceDir: string;
	/** The temporary pi agent directory (models.json, settings.json). */
	readonly agentDir: string;
	/** The parent's session file (the oracle's primary source). */
	readonly parentSessionPath: string;
	/** The parent's task artifact (the `@<path>` file argument). */
	readonly parentTaskPath: string;
	/** The fixed path of the child marker file the writer run's task names. */
	readonly childMarkerPath: string;
	/** The child session files discovered under `<workspace>/.subagents/`. */
	readonly childSessionPaths: readonly string[];
	/** The parent's exit code, or `null` when it could not be read. */
	readonly exitCode: number | null;
	/** True when the run hit the hard timeout and was killed. */
	readonly timedOut: boolean;
	/** The parent's captured stdout (its final assistant text in `--print` mode). */
	readonly stdout: string;
	/** The parent's captured stderr. */
	readonly stderr: string;
	/** The model configuration the run used. */
	readonly model: HeadlessE2EModel;
}

/**
 * Resolve the model target from explicit options, then the environment.
 *
 * The API key is required: a model-in-the-loop run cannot start without a
 * reachable, authenticated endpoint. Throws when it is missing so a caller can
 * turn the error into a skip with a readable reason.
 */
export function resolveHeadlessE2EModel(
	explicit?: HeadlessE2EModel,
): HeadlessE2EModel {
	const apiKey = explicit?.apiKey ?? process.env[E2E_API_KEY_ENV_VAR];
	if (apiKey === undefined || apiKey === "") {
		throw new Error(
			`No model API key for the headless e2e: set ${E2E_API_KEY_ENV_VAR}.`,
		);
	}
	return {
		providerId: explicit?.providerId ?? E2E_PROVIDER_ID,
		modelId:
			explicit?.modelId ?? process.env[E2E_MODEL_ENV_VAR] ?? E2E_MODEL_DEFAULT,
		baseUrl:
			explicit?.baseUrl ??
			process.env[E2E_BASE_URL_ENV_VAR] ??
			E2E_BASE_URL_DEFAULT,
		apiKey,
	};
}

/**
 * The fixed parent task.
 *
 * The parent launches exactly two runs in one `subagents_launch` call, both
 * blocking: the writer (whose task names the marker file and writes the fixed
 * token to it) and the holder (whose task is a fixed sleep). Both being
 * blocking means the launch tool call awaits both settlements, so the parent's
 * turn stays open — streaming — across the writer's settlement; the writer's
 * result steer therefore lands in the running turn and is persisted in the
 * parent's session file. The parent is then told to end its turn with the
 * fixed marker token.
 */
export function buildParentTask(markerPath: string): string {
	return [
		"This is a fixed end-to-end validation task. Follow the steps exactly and call no tools other than the ones named here.",
		"",
		"Step 1: Call the subagents_launch tool exactly once. Its runs array must contain exactly these two runs, in this order:",
		"",
		`Run 1:`,
		`- name: "${E2E_RUN_NAME}"`,
		`- blocking: true`,
		`- task: "Use the write tool to create the file ${markerPath} containing exactly the text ${E2E_CHILD_MARKER} (a single line, nothing else). Once the write succeeds, immediately call the done tool."`,
		"",
		`Run 2:`,
		`- name: "${E2E_HOLDER_RUN_NAME}"`,
		`- blocking: true`,
		`- task: "Run this exact bash command: sleep ${E2E_HOLDER_SLEEP_SECONDS}. Wait for it to complete, then immediately call the done tool."`,
		"",
		`Step 2: After the subagents_launch call returns, reply with exactly the following single line and nothing else:`,
		`${E2E_PARENT_MARKER}`,
	].join("\n");
}

/**
 * The parent extension entry path (the package's parent-side register entry).
 *
 * The pi `--extension` loader requires a default-export factory; the entry
 * provides one (see `registerSubagentsExtension`). Resolved from this file's
 * location so it works from source in dev.
 */
export function parentExtensionPath(): string {
	const here = dirname(fileURLToPath(import.meta.url));
	return resolve(here, "..", "registerSubagentsExtension.ts");
}

/** Write the temporary pi agent directory (models.json + settings.json). */
function writeAgentDir(agentDir: string, model: HeadlessE2EModel): void {
	mkdirSync(agentDir, { recursive: true });
	const modelsJson = {
		providers: {
			[model.providerId]: {
				name: "E2E local model",
				baseUrl: model.baseUrl,
				apiKey: model.apiKey,
				api: "openai-completions",
				models: [
					{
						id: model.modelId,
						name: model.modelId,
						input: ["text"],
						contextWindow: 131072,
						maxTokens: 8192,
					},
				],
			},
		},
	};
	const settingsJson = {
		defaultProvider: model.providerId,
		defaultModel: `${model.providerId}/${model.modelId}`,
	};
	writeFileSync(
		join(agentDir, "models.json"),
		`${JSON.stringify(modelsJson, null, 2)}\n`,
	);
	writeFileSync(
		join(agentDir, "settings.json"),
		`${JSON.stringify(settingsJson, null, 2)}\n`,
	);
}

/** Send a signal to the parent's whole process group (POSIX). */
function signalProcessGroup(pid: number | undefined, signal: NodeJS.Signals): void {
	if (pid === undefined) return;
	try {
		process.kill(-pid, signal);
	} catch {
		// The group is already gone (or the platform is not POSIX): the per-pid
		// fallback below still applies.
	}
	try {
		process.kill(pid, signal);
	} catch {
		// Already exited — nothing to signal.
	}
}

/**
 * Sweep for orphan processes whose command line carries the run's temp dir.
 *
 * Subagent children run in their own process groups (they are detached), so a
 * group kill on the parent's group does not reach them; the normal path relies
 * on the parent's `session_shutdown` handler killing them. This sweep is the
 * belt-and-braces pass after a hard-kill: any process still referencing the
 * run's unique temp directory is part of the run and gets SIGKILLed.
 *
 * @param marker A unique path fragment only this run's processes carry.
 * @returns The number of processes signalled.
 */
export function sweepOrphanProcesses(marker: string): number {
	let listing: string;
	try {
		listing = execFileSync("ps", ["-axo", "pid=,command="], {
			encoding: "utf8",
		});
	} catch {
		return 0;
	}
	const pids: number[] = [];
	for (const line of listing.split("\n")) {
		if (!line.includes(marker)) continue;
		const match = line.trim().match(/^(\d+)/);
		if (!match) continue;
		const pid = Number(match[1]);
		if (!Number.isFinite(pid) || pid === process.pid) continue;
		pids.push(pid);
	}
	for (const pid of pids) {
		try {
			process.kill(pid, "SIGKILL");
		} catch {
			// Already gone.
		}
	}
	return pids.length;
}

/**
 * Run one headless background-lifecycle validation and return its artifacts.
 *
 * The sequence:
 * 1. Build the temp run directory (workspace, sessions, pi agent dir).
 * 2. Write the fixed parent task and the agent-dir model configuration.
 * 3. Spawn the headless parent (detached, so its whole tree is one group).
 * 4. Wait for the parent to exit under the hard timeout; on the timeout, signal
 *    the parent's process group (TERM, then KILL) and sweep for orphans.
 * 5. Discover the child session files and return every path plus the captured
 *    stdout/stderr.
 *
 * The caller owns cleanup of the temp directory ({@link cleanupE2EDir}); the
 * directory is kept on a failed run so the session files can be diagnosed.
 *
 * @param options Run options (model, timeout, base dir).
 * @returns The run's outcome and artifact paths.
 */
export async function runHeadlessE2E(
	options: HeadlessE2EOptions = {},
): Promise<HeadlessE2EResult> {
	const model = resolveHeadlessE2EModel(options.model);
	const timeoutMs = options.timeoutMs ?? E2E_HARD_TIMEOUT_MS;
	const baseDir = options.baseDir ?? tmpdir();
	const piCommand = options.piCommand ?? process.env[E2E_PI_COMMAND_ENV_VAR] ?? "pi";

	// 1. The temp run directory.
	const runId = Date.now().toString(36);
	const tempDir = mkdtempSync(join(baseDir, `nexus-subagents-e2e-${runId}-`));
	const workspaceDir = join(tempDir, "workspace");
	const agentDir = join(tempDir, "agent");
	const sessionsDir = join(tempDir, "sessions");
	mkdirSync(workspaceDir, { recursive: true });
	mkdirSync(sessionsDir, { recursive: true });

	// 2. The fixed parent task and the model configuration.
	const markerPath = join(workspaceDir, E2E_CHILD_MARKER_FILE);
	const parentTaskPath = join(tempDir, "parent-task.md");
	writeFileSync(parentTaskPath, buildParentTask(markerPath), "utf8");
	const parentSessionPath = join(sessionsDir, "parent.jsonl");
	writeAgentDir(agentDir, model);

	// 3. Spawn the headless parent: the one-shot form, the extension loaded, the
	//    temp session directory, the task by artifact-file reference. Detached so
	//    the parent leads its own process group and the whole tree can be signalled.
	const parentArgs = [
		"--print",
		"--no-approve",
		"--session",
		parentSessionPath,
		"--extension",
		parentExtensionPath(),
		`@${parentTaskPath}`,
	];
	const parent: ChildProcess = spawn(piCommand, parentArgs, {
		cwd: workspaceDir,
		detached: true,
		stdio: ["ignore", "pipe", "pipe"],
		env: { ...process.env, [PI_AGENT_DIR_ENV_VAR]: agentDir },
	});
	const parentPid = parent.pid;
	let stdout = "";
	let stderr = "";
	parent.stdout?.on("data", (chunk: Buffer) => {
		stdout += chunk.toString("utf8");
	});
	parent.stderr?.on("data", (chunk: Buffer) => {
		stderr += chunk.toString("utf8");
	});
	const exitPromise = new Promise<number | null>((resolveExit) => {
		parent.once("error", () => resolveExit(null));
		parent.once("exit", (code) => resolveExit(code));
	});

	// 4. Wait under the hard timeout.
	let timedOut = false;
	const timeoutHandle = setTimeout(() => {
		timedOut = true;
		signalProcessGroup(parentPid, "SIGTERM");
		// Give the shutdown path (session_shutdown -> manager dispose) a grace
		// period to reap the children, then force the group down.
		setTimeout(
			() => signalProcessGroup(parentPid, "SIGKILL"),
			10_000,
		).unref?.();
	}, timeoutMs);
	const exitCode = await Promise.race([
		exitPromise,
		new Promise<number | null>((resolveRace) => {
			setTimeout(() => resolveRace(null), timeoutMs + 15_000).unref?.();
		}),
	]);
	clearTimeout(timeoutHandle);

	// The run is over (or was forced over): make sure nothing from it is left.
	const swept = sweepOrphanProcesses(tempDir);
	void swept;

	// 5. Discover the child session files (the parent's run files under the
	//    workspace's `.subagents` directory; sidecars are `<session>.exit`).
	const subagentsDir = join(workspaceDir, ".subagents");
	let childSessionPaths: string[] = [];
	try {
		childSessionPaths = readdirSync(subagentsDir)
			.filter((name) => name.endsWith(".jsonl"))
			.map((name) => join(subagentsDir, name))
			.sort();
	} catch {
		childSessionPaths = [];
	}

	return {
		runId,
		tempDir,
		workspaceDir,
		agentDir,
		parentSessionPath,
		parentTaskPath,
		childMarkerPath: markerPath,
		childSessionPaths,
		exitCode,
		timedOut,
		stdout,
		stderr,
		model,
	};
}

/**
 * Remove a run's temp directory (all session files, artifacts, and the agent
 * dir). Call it after the assertions read what they need; keep the directory
 * on a failed run so the session files can be diagnosed.
 */
export function cleanupE2EDir(result: HeadlessE2EResult): void {
	rmSync(result.tempDir, { recursive: true, force: true });
}
