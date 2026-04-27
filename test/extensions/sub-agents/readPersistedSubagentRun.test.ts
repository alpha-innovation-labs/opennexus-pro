import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { readPersistedSubagentRun } from "../../../packages/extensions/src/sub-agents/runtime/readPersistedSubagentRun.js";

/**
 * Creates one temporary subagent storage root.
 *
 * @returns Temporary agent directory.
 */
async function createTempAgentDir(): Promise<string> {
  return mkdtemp(join(tmpdir(), "nexus-subagent-run-"));
}

test("readPersistedSubagentRun backfills cwd for older snapshots", async () => {
  const agentDir = await createTempAgentDir();
  process.env.NEXUS_CODING_AGENT_DIR = agentDir;
  await mkdir(join(agentDir, "subagents"), { recursive: true });
  await writeFile(
    join(agentDir, "subagents", "run-1.json"),
    JSON.stringify({ id: "run-1", title: "old", prompt: "p", subagentType: "Explore", status: "completed", background: false, createdAt: 1, resultText: "", liveAssistantText: "", liveThinkingText: "", activeTool: null, transcript: [], toolCalls: 0, contextProviderIds: [] }),
  );

  const run = await readPersistedSubagentRun("run-1");
  assert.equal(run?.cwd, "");

  delete process.env.NEXUS_CODING_AGENT_DIR;
});
