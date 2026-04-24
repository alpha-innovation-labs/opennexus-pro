import type { RtkRuntime } from "./createRtkRuntime.js";

const runtimes = new Map<string, RtkRuntime>();

/**
 * Stores the RTK runtime for a cwd.
 *
 * @param cwd Session cwd.
 * @param runtime RTK runtime wrapper.
 */
export function setRtkRuntimeForCwd(cwd: string, runtime: RtkRuntime): void {
  runtimes.set(cwd, runtime);
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
 * Clears the RTK runtime for a cwd.
 *
 * @param cwd Session cwd.
 */
export function clearRtkRuntimeForCwd(cwd: string): void {
  runtimes.delete(cwd);
}
