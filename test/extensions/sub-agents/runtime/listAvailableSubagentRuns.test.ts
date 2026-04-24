import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createSubagentRun } from "../../../../src/extensions/sub-agents/runtime/createSubagentRun.js";
import { listAvailableSubagentRuns } from "../../../../src/extensions/sub-agents/runtime/listAvailableSubagentRuns.js";
import { sharedSubagentRuntime } from "../../../../src/extensions/sub-agents/runtime/sharedSubagentRuntime.js";
import { writeSubagentRunSnapshot } from "../../../../src/extensions/sub-agents/runtime/writeSubagentRunSnapshot.js";

/**
 * Saves and restores the subagent storage env overrides.
 *
 * @returns Cleanup callback.
 */
function withAgentDir(homeDir: string): () => void {
  const previousNexus = process.env.NEXUS_CODING_AGENT_DIR;
  const previousPi = process.env.PI_CODING_AGENT_DIR;
  process.env.NEXUS_CODING_AGENT_DIR = homeDir;
  delete process.env.PI_CODING_AGENT_DIR;
  return () => {
    if (previousNexus === undefined) delete process.env.NEXUS_CODING_AGENT_DIR;
    else process.env.NEXUS_CODING_AGENT_DIR = previousNexus;
    if (previousPi === undefined) delete process.env.PI_CODING_AGENT_DIR;
    else process.env.PI_CODING_AGENT_DIR = previousPi;
  };
}

test.beforeEach(() => {
  sharedSubagentRuntime.clear();
});

test.afterEach(() => {
  sharedSubagentRuntime.clear();
});

/**
 * Verifies /agents scope filtering only returns runs from the current parent session and cwd.
 */
test("listAvailableSubagentRuns filters by cwd and parent session file", async () => {
  const agentDir = await mkdtemp(join(tmpdir(), "nexus-subagent-history-"));
  const restoreAgentDir = withAgentDir(agentDir);
  const cwd = "/workspace/project";
  const parentSessionFile = "/sessions/parent.jsonl";

  try {
    const matchingRuntimeRun = createSubagentRun("match runtime", { description: "match runtime", subagentType: "Librarian" }, cwd);
    matchingRuntimeRun.id = "runtime-match";
    matchingRuntimeRun.createdAt = 20;
    matchingRuntimeRun.parentSessionFile = parentSessionFile;

    const ignoredRuntimeRun = createSubagentRun("ignore runtime", { description: "ignore runtime", subagentType: "Librarian" }, "/workspace/other");
    ignoredRuntimeRun.id = "runtime-ignore";
    ignoredRuntimeRun.createdAt = 40;
    ignoredRuntimeRun.parentSessionFile = parentSessionFile;

    sharedSubagentRuntime.setRun(matchingRuntimeRun);
    sharedSubagentRuntime.setRun(ignoredRuntimeRun);

    const matchingPersistedRun = createSubagentRun("match persisted", { description: "match persisted", subagentType: "Librarian" }, cwd);
    matchingPersistedRun.id = "persisted-match";
    matchingPersistedRun.createdAt = 30;
    matchingPersistedRun.parentSessionFile = parentSessionFile;
    await writeSubagentRunSnapshot(matchingPersistedRun);

    const ignoredPersistedRun = createSubagentRun("ignore persisted", { description: "ignore persisted", subagentType: "Librarian" }, cwd);
    ignoredPersistedRun.id = "persisted-ignore";
    ignoredPersistedRun.createdAt = 50;
    ignoredPersistedRun.parentSessionFile = "/sessions/other.jsonl";
    await writeSubagentRunSnapshot(ignoredPersistedRun);

    const runs = await listAvailableSubagentRuns({ cwd, parentSessionFile });

    assert.deepEqual(runs.map((run) => run.id), ["persisted-match", "runtime-match"]);
    assert.ok(runs.every((run) => run.cwd === cwd));
    assert.ok(runs.every((run) => run.parentSessionFile === parentSessionFile));
  } finally {
    restoreAgentDir();
    await rm(agentDir, { recursive: true, force: true });
  }
});
