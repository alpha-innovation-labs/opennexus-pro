/**
 * Checks whether a process id still belongs to a live process.
 *
 * @param pid Process id to inspect.
 * @returns True when the process appears live.
 */
export function isProcessLive(pid: number): boolean {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    return code === "EPERM";
  }
}
