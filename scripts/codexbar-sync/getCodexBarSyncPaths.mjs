import { join } from "node:path";

/**
 * Builds repository-local paths for CodexBar sync state and cache.
 *
 * @param {string} rootDir Nexus repository root.
 * @returns {{ statePath: string, cacheDir: string }} Sync paths.
 */
export function getCodexBarSyncPaths(rootDir) {
  return {
    statePath: join(rootDir, ".codexbar-sync.json"),
    cacheDir: join(rootDir, ".cache", "codexbar"),
  };
}
