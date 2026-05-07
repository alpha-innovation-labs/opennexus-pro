import type { ChildProcess } from "node:child_process";

/**
 * Stops a looping Tetris music child process and its process group.
 *
 * @param processHandle Child process to stop.
 */
export function stopTetrisMusic(processHandle: ChildProcess | null): void {
	if (!processHandle?.pid) return;
	try {
		globalThis.process.kill(-processHandle.pid, "SIGTERM");
	} catch {
		try {
			processHandle.kill("SIGTERM");
		} catch {
			// The player may have already exited.
		}
	}
}
