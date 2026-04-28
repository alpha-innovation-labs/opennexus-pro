import { writeFileSync } from "node:fs";

/**
 * Writes the CodexBar sync marker state.
 *
 * @param {string} statePath State JSON path.
 * @param {string} commit CodexBar commit that has been reviewed/imported.
 * @param {string | undefined} previousCommit Previously recorded commit.
 */
export function writeCodexBarSyncState(statePath, commit, previousCommit) {
  writeFileSync(statePath, `${JSON.stringify({ lastSyncedCommit: commit, previousCommit, syncedAt: new Date().toISOString() }, null, 2)}\n`);
}
