/**
 * Checks whether a process id still exists for stale registry pruning.
 *
 * @param pid Process id to inspect.
 * @returns True when the process appears to be running.
 */
export declare function isProcessRunning(pid: number): boolean;
