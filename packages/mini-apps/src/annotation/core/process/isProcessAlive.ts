/**
 * Checks whether a process id is currently alive.
 *
 * @param pid Process id to inspect.
 * @returns True when the process is alive.
 */
export function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}
