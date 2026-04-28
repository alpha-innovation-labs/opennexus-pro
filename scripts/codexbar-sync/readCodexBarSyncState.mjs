import { existsSync, readFileSync } from "node:fs";

/**
 * Reads the persisted CodexBar sync state.
 *
 * @param {string} statePath State JSON path.
 * @returns {{ lastSyncedCommit?: string } | undefined} Sync state.
 */
export function readCodexBarSyncState(statePath) {
  if (!existsSync(statePath)) return undefined;
  return JSON.parse(readFileSync(statePath, "utf8"));
}
