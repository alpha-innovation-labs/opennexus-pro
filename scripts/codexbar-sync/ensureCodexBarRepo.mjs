import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { runGit } from "./runGit.mjs";

/**
 * Ensures the local CodexBar cache exists and is fetched.
 *
 * @param {string} cacheDir Local clone directory.
 * @param {string} repoUrl CodexBar upstream repository URL.
 */
export function ensureCodexBarRepo(cacheDir, repoUrl) {
  if (!existsSync(cacheDir)) {
    mkdirSync(dirname(cacheDir), { recursive: true });
    runGit(["clone", "--filter=blob:none", repoUrl, cacheDir], process.cwd());
  }
  runGit(["fetch", "origin", "main", "--prune"], cacheDir);
}
