import type { RtkRuntime } from "./createRtkRuntime";

const runtimes = new Map<string, RtkRuntime>();
let activeRtkCwd: string | undefined;

/**
 * Stores the RTK runtime for a cwd.
 *
 * @param cwd Session cwd.
 * @param runtime RTK runtime wrapper.
 */
export function setRtkRuntimeForCwd(cwd: string, runtime: RtkRuntime): void {
	runtimes.set(cwd, runtime);
	activeRtkCwd = cwd;
}

/**
 * Returns the RTK runtime for a cwd.
 *
 * @param cwd Session cwd.
 * @returns Matching RTK runtime, if any.
 */
export function getRtkRuntimeForCwd(cwd: string): RtkRuntime | undefined {
	return runtimes.get(cwd);
}

/**
 * Returns the active RTK cwd for the current session.
 *
 * @returns Active cwd, if any.
 */
export function getActiveRtkCwd(): string | undefined {
	return activeRtkCwd;
}

/**
 * Clears the RTK runtime for a cwd.
 *
 * @param cwd Session cwd.
 */
export function clearRtkRuntimeForCwd(cwd: string): void {
	runtimes.delete(cwd);
	if (activeRtkCwd === cwd) {
		activeRtkCwd = undefined;
	}
}
