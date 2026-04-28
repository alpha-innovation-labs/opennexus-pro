#!/usr/bin/env node
import { cwd } from "node:process";
import { ensureCodexBarRepo } from "./ensureCodexBarRepo.mjs";
import { filterUsageRelevantFiles } from "./filterUsageRelevantFiles.mjs";
import { getCodexBarSyncPaths } from "./getCodexBarSyncPaths.mjs";
import { listCodexBarChanges } from "./listCodexBarChanges.mjs";
import { parseCodexBarSyncArgs } from "./parseCodexBarSyncArgs.mjs";
import { readCodexBarSyncState } from "./readCodexBarSyncState.mjs";
import { runGit } from "./runGit.mjs";
import { writeCodexBarSyncState } from "./writeCodexBarSyncState.mjs";

const repoUrl = process.env.CODEXBAR_REPO_URL || "https://github.com/steipete/CodexBar.git";
const args = parseCodexBarSyncArgs(process.argv.slice(2));
const paths = getCodexBarSyncPaths(cwd());
ensureCodexBarRepo(paths.cacheDir, repoUrl);
const head = runGit(["rev-parse", "origin/main"], paths.cacheDir);
const state = readCodexBarSyncState(paths.statePath);

if (!state?.lastSyncedCommit) {
  console.log(`CodexBar upstream: ${head}`);
  console.log("No sync marker found. Run `just codexbar-sync --mark` after choosing this baseline.");
} else {
  const changes = listCodexBarChanges(paths.cacheDir, state.lastSyncedCommit, head);
  const usageFiles = filterUsageRelevantFiles(changes.files);
  console.log(`CodexBar last synced: ${state.lastSyncedCommit}`);
  console.log(`CodexBar upstream:    ${head}`);
  console.log(`Commits since sync:  ${changes.commits.length}`);
  for (const commit of changes.commits.slice(0, 40)) console.log(`  ${commit}`);
  console.log(`Usage files changed: ${usageFiles.length}`);
  for (const file of usageFiles.slice(0, 80)) console.log(`  ${file}`);
}

if (args.mark) {
  writeCodexBarSyncState(paths.statePath, head, state?.lastSyncedCommit);
  console.log(`Marked CodexBar sync at ${head}`);
}
