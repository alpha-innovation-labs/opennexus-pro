/**
 * Checks whether a process id currently accepts signal 0.
 *
 * @param pid Process id to inspect.
 * @returns True when the process appears alive.
 */
export function isProcessAlive(pid: number): boolean {
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
}
