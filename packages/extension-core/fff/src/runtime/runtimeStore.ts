import type { FffRuntime } from "./FffRuntime";

const runtimes = new Map<string, FffRuntime>();

/**
 * Stores the active FFF runtime for a cwd.
 *
 * @param cwd Session cwd.
 * @param runtime Runtime instance.
 */
export function setRuntimeForCwd(cwd: string, runtime: FffRuntime): void {
	runtimes.set(cwd, runtime);
}

/**
 * Returns the active FFF runtime for a cwd.
 *
 * @param cwd Session cwd.
 * @returns Matching runtime, if present.
 */
export function getRuntimeForCwd(cwd: string): FffRuntime | undefined {
	return runtimes.get(cwd);
}

/**
 * Deletes the active FFF runtime for a cwd.
 *
 * @param cwd Session cwd.
 */
export function clearRuntimeForCwd(cwd: string): void {
	runtimes.delete(cwd);
}
