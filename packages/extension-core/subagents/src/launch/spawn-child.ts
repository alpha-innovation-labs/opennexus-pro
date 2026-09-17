import { type ChildProcess, spawn } from "node:child_process";
import type { SpawnChildProcessOptions, SpawnedChildProcess } from "./types";

/**
 * Spawn a detached, unref'd child process.
 *
 * This is the low-level spawn primitive. It applies the two process properties the
 * rest of the system depends on:
 *
 * - **Detached.** `detached: true` makes the child a process-group leader (POSIX
 *   `setsid`). A group signal (`kill(-pid)`) then takes down the child and anything
 *   it spawned. Without this, a stop leaves orphan grandchildren alive.
 * - **Unref'd.** `child.unref()` removes the child from the parent's process table,
 *   so the parent can exit freely while a detached child keeps running.
 *
 * The caller owns the child's `exit` and `error` events (the running-registry and
 * completion layers attach them); this primitive does not.
 */
export function spawnChildProcess(
	options: SpawnChildProcessOptions,
): SpawnedChildProcess {
	const child: ChildProcess = spawn(options.command, options.args, {
		cwd: options.cwd,
		env: options.env as NodeJS.ProcessEnv,
		stdio: options.stdio ?? "ignore",
		// A group leader is required for a group kill to reach the whole subtree.
		detached: options.detached ?? true,
	});

	// The parent does not keep the process table open for the child.
	child.unref();

	const pid = child.pid;
	if (pid === undefined) {
		throw new Error(
			"Spawned child has no pid; the run cannot be tracked or stopped.",
		);
	}

	return { child, pid };
}
