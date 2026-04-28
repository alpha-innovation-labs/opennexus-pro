/**
 * Checks whether a process id still exists for stale registry pruning.
 *
 * @param pid Process id to inspect.
 * @returns True when the process appears to be running.
 */
export function isProcessRunning(pid: number): boolean {
	if (!Number.isInteger(pid) || pid <= 0) return false;
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
}
