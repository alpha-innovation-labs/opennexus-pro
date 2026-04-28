import { runGit } from "./runGit.mjs";

/**
 * Lists commits and files changed since the last synced CodexBar commit.
 *
 * @param {string} cacheDir CodexBar clone directory.
 * @param {string} fromCommit Previous synced commit.
 * @param {string} toCommit Current upstream commit.
 * @returns {{ commits: string[], files: string[] }} Change summary.
 */
export function listCodexBarChanges(cacheDir, fromCommit, toCommit) {
  const range = `${fromCommit}..${toCommit}`;
  return {
    commits: splitLines(runGit(["log", "--oneline", range], cacheDir)),
    files: splitLines(runGit(["diff", "--name-only", range], cacheDir)),
  };
}

/**
 * Splits command output into non-empty lines.
 *
 * @param {string} value Command output.
 * @returns {string[]} Output lines.
 */
function splitLines(value) {
  return value ? value.split("\n").filter(Boolean) : [];
}
