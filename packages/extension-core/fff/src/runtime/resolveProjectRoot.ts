import { dirname, resolve } from "node:path";
import { pathExists } from "./pathExists";

/**
 * Resolves the closest git-root ancestor for the provided cwd.
 *
 * @param cwd Session cwd.
 * @returns Project root.
 */
export async function resolveProjectRoot(cwd: string): Promise<string> {
  const start = resolve(cwd);
  let current = start;
  while (true) {
    if (await pathExists(resolve(current, ".git"))) return current;
    const parent = dirname(current);
    if (parent === current) return start;
    current = parent;
  }
}
