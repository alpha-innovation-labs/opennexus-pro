import { isProcessAlive } from "./isProcessAlive.js";

/**
 * Waits for a process to exit.
 *
 * @param pid Process id to observe.
 * @param timeoutMs Maximum wait time.
 * @returns True when the process exits in time.
 */
export async function waitForProcessExit(pid: number, timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() <= deadline) {
    if (!isProcessAlive(pid)) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return !isProcessAlive(pid);
}
